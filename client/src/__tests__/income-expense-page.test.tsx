import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import IncomeExpensePage from '../pages/income-expense-page';
import { useAuth } from '@/hooks/use-auth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { renderWithProviders } from './test-utils';

// Mock the hooks
vi.mock('@/hooks/use-auth', () => ({
  useAuth: vi.fn(),
}));

vi.mock('@tanstack/react-query', () => ({
  useQuery: vi.fn(),
  useMutation: vi.fn(),
  useQueryClient: vi.fn(() => ({
    invalidateQueries: vi.fn(),
  })),
}));

// Mock components used in the page
vi.mock('@/components/income-expense/transaction-list', () => ({
  TransactionList: ({ transactions, onEdit, onDelete }: any) => (
    <div data-testid="transaction-list">
      {transactions?.map((t: any) => (
        <div key={t.id} data-testid="transaction-item">
          <span>{t.description}</span>
          <button onClick={() => onEdit(t)}>Edit</button>
          <button onClick={() => onDelete(t.id)}>Delete</button>
        </div>
      ))}
    </div>
  ),
}));

vi.mock('@/components/income-expense/transaction-form', () => ({
  TransactionForm: ({ onSubmit, transaction, onCancel }: any) => (
    <div data-testid="transaction-form">
      <button onClick={() => onSubmit({
        description: 'Test Transaction',
        amount: '100.00',
        category: 'Income',
        date: '2023-07-01',
        type: 'income'
      })}>
        Submit
      </button>
      <button onClick={onCancel}>Cancel</button>
    </div>
  ),
}));

vi.mock('@/components/income-expense/transaction-filters', () => ({
  TransactionFilters: ({ onFilterChange }: any) => (
    <div data-testid="transaction-filters">
      <button onClick={() => onFilterChange({
        startDate: '2023-01-01',
        endDate: '2023-12-31',
        category: 'All',
        type: 'All'
      })}>
        Apply Filters
      </button>
    </div>
  ),
}));

vi.mock('@/components/layout/sidebar', () => ({
  Sidebar: () => <div data-testid="sidebar">Sidebar</div>,
}));

vi.mock('@/components/income-expense/csv-import', () => ({
  CSVImport: ({ onImportComplete }: any) => (
    <div data-testid="csv-import">
      <button onClick={() => onImportComplete(5)}>Import</button>
    </div>
  ),
}));

vi.mock('@/components/ui/dialog', () => ({
  Dialog: ({ children, open }: any) => (
    <div data-testid="dialog" data-open={open}>
      {children}
    </div>
  ),
  DialogContent: ({ children }: any) => (
    <div data-testid="dialog-content">{children}</div>
  ),
  DialogHeader: ({ children }: any) => (
    <div data-testid="dialog-header">{children}</div>
  ),
  DialogTitle: ({ children }: any) => (
    <div data-testid="dialog-title">{children}</div>
  ),
  DialogDescription: ({ children }: any) => (
    <div data-testid="dialog-description">{children}</div>
  ),
  DialogFooter: ({ children }: any) => (
    <div data-testid="dialog-footer">{children}</div>
  ),
}));

vi.mock('@/components/ui/toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

describe('IncomeExpensePage', () => {
  const mockUser = { 
    id: 1, 
    name: 'Test User', 
    email: 'test@example.com' 
  };
  
  const mockTransactions = [
    {
      id: 1,
      description: 'Salary',
      amount: '3000.00',
      category: 'Income',
      subcategory: 'Salary',
      date: '2023-07-01',
      type: 'income',
    },
    {
      id: 2,
      description: 'Groceries',
      amount: '-150.00',
      category: 'Essentials',
      subcategory: 'Groceries',
      date: '2023-07-05',
      type: 'expense',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock authenticated user
    (useAuth as any).mockReturnValue({ 
      user: mockUser,
      isAuthenticated: true
    });
    
    // Mock transaction data
    (useQuery as any).mockReturnValue({
      data: mockTransactions,
      isLoading: false,
      isError: false,
      error: null,
    });
    
    // Mock mutation
    (useMutation as any).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
      isError: false,
      error: null,
    });
  });

  it('renders the income and expense page with all components', () => {
    render(<IncomeExpensePage />);
    
    // Check for page title
    expect(screen.getByText('Income & Expenses')).toBeInTheDocument();
    
    // Check for components
    expect(screen.getByTestId('transaction-list')).toBeInTheDocument();
    expect(screen.getByTestId('transaction-filters')).toBeInTheDocument();
    expect(screen.getByTestId('sidebar')).toBeInTheDocument();
    
    // Check for action buttons
    expect(screen.getByText('Add Transaction')).toBeInTheDocument();
    expect(screen.getByText('Import CSV')).toBeInTheDocument();
  });

  it('opens transaction form when Add Transaction button is clicked', () => {
    render(<IncomeExpensePage />);
    
    // Click the Add Transaction button
    fireEvent.click(screen.getByText('Add Transaction'));
    
    // Check that the form is displayed
    expect(screen.getByTestId('dialog')).toHaveAttribute('data-open', 'true');
    expect(screen.getByTestId('transaction-form')).toBeInTheDocument();
  });

  it('handles transaction creation successfully', async () => {
    const mockMutate = vi.fn();
    (useMutation as any).mockReturnValue({
      mutate: mockMutate,
      isPending: false,
      isError: false,
      error: null,
    });
    
    render(<IncomeExpensePage />);
    
    // Open transaction form
    fireEvent.click(screen.getByText('Add Transaction'));
    
    // Submit the form
    fireEvent.click(screen.getByText('Submit'));
    
    // Check that the mutation was called
    expect(mockMutate).toHaveBeenCalledWith(
      {
        description: 'Test Transaction',
        amount: '100.00',
        category: 'Income',
        date: '2023-07-01',
        type: 'income'
      },
      expect.any(Object)
    );
  });

  it('handles transaction editing', async () => {
    const mockMutate = vi.fn();
    (useMutation as any).mockReturnValue({
      mutate: mockMutate,
      isPending: false,
      isError: false,
      error: null,
    });
    
    render(<IncomeExpensePage />);
    
    // Click edit button on first transaction
    fireEvent.click(screen.getAllByText('Edit')[0]);
    
    // Check that edit form is displayed
    expect(screen.getByTestId('dialog')).toHaveAttribute('data-open', 'true');
    expect(screen.getByTestId('transaction-form')).toBeInTheDocument();
    
    // Submit the form
    fireEvent.click(screen.getByText('Submit'));
    
    // Check that the mutation was called with the correct arguments
    expect(mockMutate).toHaveBeenCalledWith(
      expect.objectContaining({
        description: 'Test Transaction',
      }),
      expect.any(Object)
    );
  });

  it('handles transaction deletion', async () => {
    const mockMutate = vi.fn();
    (useMutation as any).mockReturnValue({
      mutate: mockMutate,
      isPending: false,
      isError: false,
      error: null,
    });
    
    render(<IncomeExpensePage />);
    
    // Click delete button on first transaction
    fireEvent.click(screen.getAllByText('Delete')[0]);
    
    // Check that confirmation dialog is displayed
    expect(screen.getByTestId('dialog')).toHaveAttribute('data-open', 'true');
    expect(screen.getByText('Are you sure?')).toBeInTheDocument();
    
    // Confirm deletion
    fireEvent.click(screen.getByText('Delete Transaction'));
    
    // Check that the mutation was called with the correct ID
    expect(mockMutate).toHaveBeenCalledWith(
      1,  // ID of the first transaction
      expect.any(Object)
    );
  });

  it('handles filtering transactions', async () => {
    const mockUseQuery = vi.fn();
    (useQuery as any).mockImplementation((key: any, options: any) => {
      mockUseQuery(key, options);
      return {
        data: mockTransactions,
        isLoading: false,
        isError: false,
        error: null,
      };
    });
    
    render(<IncomeExpensePage />);
    
    // Apply filters
    fireEvent.click(screen.getByText('Apply Filters'));
    
    // Check that query was called with the correct parameters
    await waitFor(() => {
      expect(mockUseQuery).toHaveBeenCalledWith(
        expect.arrayContaining(['transactions']),
        expect.objectContaining({
          queryFn: expect.any(Function)
        })
      );
    });
  });

  it('handles CSV import', async () => {
    // Get the mock invalidateQueries function from the globally mocked useQueryClient
    const queryClient = (useQueryClient as any)();
    const mockInvalidateQueries = queryClient.invalidateQueries;
    
    render(<IncomeExpensePage />);
    
    // Open import dialog
    fireEvent.click(screen.getByText('Import CSV'));
    
    // Perform import
    fireEvent.click(screen.getByText('Import'));
    
    // Check that data was refreshed
    expect(mockInvalidateQueries).toHaveBeenCalledWith(['transactions']);
  });

  it('shows loading state when fetching transactions', () => {
    // Mock loading state
    (useQuery as any).mockReturnValue({
      data: null,
      isLoading: true,
      isError: false,
      error: null,
    });
    
    render(<IncomeExpensePage />);
    
    // Check for loading indicator
    expect(screen.getByTestId('loading-indicator')).toBeInTheDocument();
  });

  it('shows error state when transaction fetching fails', () => {
    // Mock error state
    (useQuery as any).mockReturnValue({
      data: null,
      isLoading: false,
      isError: true,
      error: 'Failed to fetch transactions',
    });
    
    render(<IncomeExpensePage />);
    
    // Check for error message
    expect(screen.getByText('Error loading transactions')).toBeInTheDocument();
    expect(screen.getByText('Failed to fetch transactions')).toBeInTheDocument();
  });

  it('displays empty state when no transactions are available', () => {
    // Mock empty data
    (useQuery as any).mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
      error: null,
    });
    
    render(<IncomeExpensePage />);
    
    // Check for empty state message
    expect(screen.getByText('No transactions found')).toBeInTheDocument();
  });
}); 