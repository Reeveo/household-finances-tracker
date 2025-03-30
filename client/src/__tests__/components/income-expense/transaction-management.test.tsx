import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
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

// Mock localStorage with proper typing
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value.toString();
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
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

  // New tests for transaction deletion functionality
  describe('Transaction Deletion Functionality', () => {
    beforeEach(() => {
      vi.useFakeTimers();
      localStorageMock.clear();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('removes the transaction from the list when deleted', async () => {
      // Setup localStorage with test data
      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockTransactions));

      renderWithProviders(<TransactionManagement />);
      
      // Verify the transaction exists initially
      expect(screen.getByText('Grocery Shopping')).toBeInTheDocument();
      
      // Find and click delete button for first transaction
      const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
      fireEvent.click(deleteButtons[0]);
      
      // Confirm deletion in the dialog
      await waitFor(() => {
        const confirmButton = screen.getByRole('button', { name: /delete/i });
        fireEvent.click(confirmButton);
      });

      // Move time forward to account for animation duration
      act(() => {
        vi.advanceTimersByTime(350);
      });
      
      // Verify the transaction is removed
      await waitFor(() => {
        expect(screen.queryByText('Grocery Shopping')).not.toBeInTheDocument();
      });
      
      // Verify localStorage was updated
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'household-finance-transactions',
        expect.stringContaining('Netflix')
      );
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'household-finance-transactions',
        expect.not.stringContaining('Grocery Shopping')
      );
    });

    it('shows a confirmation dialog before deleting a transaction', async () => {
      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockTransactions));
      
      renderWithProviders(<TransactionManagement />);
      
      // Find and click delete button for first transaction
      const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
      fireEvent.click(deleteButtons[0]);
      
      // Check confirmation dialog appears with correct content
      await waitFor(() => {
        expect(screen.getByText(/are you sure you want to delete this transaction?/i)).toBeInTheDocument();
        expect(screen.getByText(/this action cannot be undone/i)).toBeInTheDocument();
        
        // Verify transaction details are shown in the dialog
        expect(screen.getByText('Grocery Shopping')).toBeInTheDocument();
        expect(screen.getByText('£45.67')).toBeInTheDocument();
        
        // Verify dialog has both Cancel and Delete buttons
        expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument();
      });
      
      // Test that Cancel closes the dialog without deleting
      fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
      
      await waitFor(() => {
        expect(screen.queryByText(/are you sure you want to delete this transaction?/i)).not.toBeInTheDocument();
      });
      
      // Verify the transaction still exists
      expect(screen.getByText('Grocery Shopping')).toBeInTheDocument();
    });

    it('applies animation when deleting a transaction', async () => {
      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockTransactions));
      
      const { container } = renderWithProviders(<TransactionManagement />);
      
      // Find and click delete button for first transaction
      const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
      fireEvent.click(deleteButtons[0]);
      
      // Confirm deletion
      await waitFor(() => {
        const confirmButton = screen.getByRole('button', { name: /delete/i });
        fireEvent.click(confirmButton);
      });
      
      // Check for animation class being applied (before the timer completes)
      expect(container.querySelector('.opacity-0')).toBeTruthy();
      expect(container.querySelector('.transition-all')).toBeTruthy();
      expect(container.querySelector('.duration-300')).toBeTruthy();
      
      // Advance timers to complete the animation
      act(() => {
        vi.advanceTimersByTime(350);
      });
      
      // After animation, the item should be removed
      await waitFor(() => {
        expect(screen.queryByText('Grocery Shopping')).not.toBeInTheDocument();
      });
    });

    it('allows deleting a transaction from the edit modal', async () => {
      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockTransactions));
      
      renderWithProviders(<TransactionManagement />);
      
      // Open edit form for the first transaction
      const editButtons = screen.getAllByRole('button', { name: /edit/i });
      fireEvent.click(editButtons[0]);
      
      // Verify edit modal is open
      await waitFor(() => {
        expect(screen.getByText(/edit transaction/i)).toBeInTheDocument();
      });
      
      // There should be a Delete button in the dialog footer
      const deleteButton = screen.getByRole('button', { name: /delete/i });
      expect(deleteButton).toBeInTheDocument();
      
      // Click the delete button
      fireEvent.click(deleteButton);
      
      // Edit dialog should close and confirmation dialog should open
      await waitFor(() => {
        expect(screen.queryByText(/edit transaction/i)).not.toBeInTheDocument();
        expect(screen.getByText(/are you sure you want to delete this transaction?/i)).toBeInTheDocument();
      });
      
      // Confirm deletion
      const confirmButton = screen.getByRole('button', { name: /delete/i });
      fireEvent.click(confirmButton);
      
      // Advance timers to complete the animation
      act(() => {
        vi.advanceTimersByTime(350);
      });
      
      // Transaction should be removed
      await waitFor(() => {
        expect(screen.queryByText('Grocery Shopping')).not.toBeInTheDocument();
      });
    });
  });
}); 