import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { TransactionManagement } from '@/components/income-expense/transaction-management';
import { renderWithProviders } from '../../test-utils';

// Mock hooks
vi.mock('@/hooks/use-mobile', () => ({
  useIsMobile: vi.fn(() => false),
}));

vi.mock('@tanstack/react-query', () => ({
  useQuery: vi.fn(),
  useMutation: vi.fn(),
  useQueryClient: vi.fn(() => ({
    invalidateQueries: vi.fn(),
  })),
}));

// Mock useAuth hook
vi.mock('@/hooks/use-auth', () => ({
  useAuth: vi.fn(() => ({
    user: { id: 1, name: 'Test User' },
    isAuthenticated: true
  })),
}));

// Mock dates to always return a specific date for testing
vi.mock('date-fns', async () => {
  const actual = await vi.importActual('date-fns');
  return {
    ...actual,
    formatDistanceToNow: vi.fn(() => '3 days ago'),
    format: vi.fn(() => '01/01/2023'),
  };
});

describe('TransactionManagement', () => {
  const mockTransactions = [
    {
      id: 1,
      date: '2023-01-15',
      description: 'Grocery Shopping',
      merchant: 'Tesco',
      merchantLogo: 'tesco.png',
      category: 'Food',
      subcategory: 'Groceries',
      amount: 45.67,
      paymentMethod: 'Credit Card',
      isRecurring: false,
      budgetMonth: '2023-01',
      notes: 'Weekly groceries'
    },
    {
      id: 2,
      date: '2023-01-20',
      description: 'Netflix Subscription',
      merchant: 'Netflix',
      merchantLogo: 'netflix.png',
      category: 'Entertainment',
      subcategory: 'Streaming',
      amount: 9.99,
      paymentMethod: 'Debit Card',
      isRecurring: true,
      frequency: 'monthly',
      budgetMonth: '2023-01',
      notes: ''
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Default mock implementations
    const { useQuery } = vi.requireMock('@tanstack/react-query');
    useQuery.mockReturnValue({
      data: mockTransactions,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn()
    });
    
    const { useMutation } = vi.requireMock('@tanstack/react-query');
    useMutation.mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
      isError: false,
      error: null
    });
  });

  it('renders transaction list with transaction data', () => {
    renderWithProviders(<TransactionManagement />);
    
    // Check that transaction data is displayed
    expect(screen.getByText('Grocery Shopping')).toBeInTheDocument();
    expect(screen.getByText('Netflix Subscription')).toBeInTheDocument();
    expect(screen.getByText('£45.67')).toBeInTheDocument();
    expect(screen.getByText('£9.99')).toBeInTheDocument();
    
    // Check for category badges
    expect(screen.getByText('Food')).toBeInTheDocument();
    expect(screen.getByText('Entertainment')).toBeInTheDocument();
  });

  it('shows loading state when data is loading', () => {
    const { useQuery } = vi.requireMock('@tanstack/react-query');
    useQuery.mockReturnValue({
      data: null,
      isLoading: true,
      isError: false,
      error: null
    });
    
    renderWithProviders(<TransactionManagement />);
    
    // Check for loading indicators
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    expect(screen.getByText('Loading transactions...')).toBeInTheDocument();
  });

  it('shows error state when there is an error', () => {
    const { useQuery } = vi.requireMock('@tanstack/react-query');
    useQuery.mockReturnValue({
      data: null,
      isLoading: false,
      isError: true,
      error: { message: 'Failed to fetch transactions' }
    });
    
    renderWithProviders(<TransactionManagement />);
    
    // Check for error message
    expect(screen.getByText('Error loading transactions')).toBeInTheDocument();
    expect(screen.getByText('Failed to fetch transactions')).toBeInTheDocument();
  });

  it('opens transaction form dialog when Add Transaction button is clicked', async () => {
    renderWithProviders(<TransactionManagement />);
    
    // Click the Add Transaction button
    fireEvent.click(screen.getByRole('button', { name: /add transaction/i }));
    
    // Check that dialog is open
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText('Add New Transaction')).toBeInTheDocument();
    });
  });

  it('opens edit form when edit button is clicked', async () => {
    renderWithProviders(<TransactionManagement />);
    
    // Find and click edit button for first transaction
    const editButtons = screen.getAllByRole('button', { name: /edit/i });
    fireEvent.click(editButtons[0]);
    
    // Check that dialog is open with edit title
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText('Edit Transaction')).toBeInTheDocument();
      
      // Form should be pre-filled with transaction data
      const descriptionInput = screen.getByLabelText('Description');
      expect(descriptionInput).toHaveValue('Grocery Shopping');
    });
  });

  it('confirms before deleting a transaction', async () => {
    renderWithProviders(<TransactionManagement />);
    
    // Find and click delete button for first transaction
    const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
    fireEvent.click(deleteButtons[0]);
    
    // Check that confirmation dialog is shown
    await waitFor(() => {
      expect(screen.getByText('Are you sure?')).toBeInTheDocument();
      expect(screen.getByText('This action cannot be undone.')).toBeInTheDocument();
    });
    
    // Cancel should close the dialog
    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
    
    await waitFor(() => {
      expect(screen.queryByText('Are you sure?')).not.toBeInTheDocument();
    });
  });

  it('submits new transaction data when form is submitted', async () => {
    const mockMutate = vi.fn();
    const { useMutation } = vi.requireMock('@tanstack/react-query');
    useMutation.mockReturnValue({
      mutate: mockMutate,
      isPending: false,
      isError: false,
      error: null
    });
    
    renderWithProviders(<TransactionManagement />);
    
    // Open the add transaction form
    fireEvent.click(screen.getByRole('button', { name: /add transaction/i }));
    
    // Fill in the form
    await waitFor(() => {
      // Fill description
      fireEvent.change(screen.getByLabelText('Description'), {
        target: { value: 'New Test Transaction' }
      });
      
      // Fill amount
      fireEvent.change(screen.getByLabelText('Amount (£)'), {
        target: { value: '99.99' }
      });
      
      // Select category
      fireEvent.click(screen.getByRole('combobox', { name: /category/i }));
      fireEvent.click(screen.getByRole('option', { name: /food/i }));
      
      // Submit the form
      fireEvent.click(screen.getByRole('button', { name: /save/i }));
    });
    
    // Check that mutation was called with form data
    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalledWith(
        expect.objectContaining({
          description: 'New Test Transaction',
          amount: 99.99,
          category: 'Food'
        }),
        expect.anything()
      );
    });
  });

  it('filters transactions when search input is used', async () => {
    renderWithProviders(<TransactionManagement />);
    
    // Enter search text
    fireEvent.change(screen.getByPlaceholderText('Search transactions...'), {
      target: { value: 'Netflix' }
    });
    
    // Only the Netflix transaction should be visible now
    await waitFor(() => {
      expect(screen.getByText('Netflix Subscription')).toBeInTheDocument();
      expect(screen.queryByText('Grocery Shopping')).not.toBeInTheDocument();
    });
  });

  it('filters transactions when category filter is applied', async () => {
    renderWithProviders(<TransactionManagement />);
    
    // Open category filter
    fireEvent.click(screen.getByRole('button', { name: /filter by category/i }));
    
    // Select 'Entertainment' category
    fireEvent.click(screen.getByRole('option', { name: /entertainment/i }));
    
    // Only the Entertainment transactions should be visible
    await waitFor(() => {
      expect(screen.getByText('Netflix Subscription')).toBeInTheDocument();
      expect(screen.queryByText('Grocery Shopping')).not.toBeInTheDocument();
    });
  });
}); 