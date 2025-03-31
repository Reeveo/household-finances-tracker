import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TransactionManagement } from '@/components/income-expense/transaction-management';
import { renderWithProviders, setupMocks } from '../../test-utils';
import { useQuery, useMutation } from '@tanstack/react-query';
import userEvent from '@testing-library/user-event';

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

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', { value: mockLocalStorage });

// Mock transactions data
const mockTransactions = [
  {
    id: 1,
    date: '2024-03-15',
    description: 'Groceries - Tesco',
    merchant: 'Tesco',
    merchantLogo: 'tesco.svg',
    category: 'Essentials',
    subcategory: 'Groceries',
    amount: -75.50,
    paymentMethod: 'Credit Card',
    isRecurring: false,
    budgetMonth: 'current',
    notes: '',
  },
  {
    id: 2,
    date: '2024-03-14',
    description: 'Monthly Salary',
    merchant: 'Acme Inc',
    merchantLogo: 'acme.svg',
    category: 'Income',
    subcategory: 'Salary',
    amount: 3000.00,
    paymentMethod: 'Bank Transfer',
    isRecurring: true,
    frequency: 'Monthly',
    budgetMonth: 'current',
    notes: 'Main job salary',
  },
];

describe('TransactionManagement', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue(null);
  });

  it('initializes with empty transactions when localStorage is empty', () => {
    render(<TransactionManagement />);

    // Check for empty state message
    expect(screen.getByText('No transactions found')).toBeInTheDocument();
    expect(screen.getByText('Clear filters')).toBeInTheDocument();
  });

  it('loads and displays transactions from localStorage', () => {
    const mockTransactions = [
      {
        id: '1',
        date: '2024-03-15',
        description: 'Groceries - Tesco',
        merchant: 'Tesco',
        amount: -75.50,
        category: 'Essentials',
        subcategory: 'Groceries',
        budgetMonth: 'current'
      },
      {
        id: '2',
        date: '2024-03-14',
        description: 'Monthly Salary',
        merchant: 'Acme Inc',
        amount: 3000.00,
        category: 'Income',
        subcategory: 'Salary',
        budgetMonth: 'current'
      }
    ];

    mockLocalStorage.getItem.mockReturnValue(JSON.stringify(mockTransactions));

    render(<TransactionManagement />);

    // Check if transactions are displayed
    expect(screen.getByText('Groceries - Tesco')).toBeInTheDocument();
    expect(screen.getByText('Monthly Salary')).toBeInTheDocument();
  });

  it('filters transactions by category', async () => {
    const mockTransactions = [
      {
        id: '1',
        date: '2024-03-15',
        description: 'Groceries - Tesco',
        merchant: 'Tesco',
        amount: -75.50,
        category: 'Essentials',
        subcategory: 'Groceries',
        budgetMonth: 'current'
      },
      {
        id: '2',
        date: '2024-03-14',
        description: 'Monthly Salary',
        merchant: 'Acme Inc',
        amount: 3000.00,
        category: 'Income',
        subcategory: 'Salary',
        budgetMonth: 'current'
      }
    ];

    mockLocalStorage.getItem.mockReturnValue(JSON.stringify(mockTransactions));

    render(<TransactionManagement />);

    // Open category filter
    const categoryButton = screen.getByRole('combobox', {
      name: /all categories/i
    });
    fireEvent.click(categoryButton);

    // Select Essentials category
    const essentialsOption = screen.getByRole('option', { name: /essentials/i });
    fireEvent.click(essentialsOption);

    // Check that only Essentials transactions are shown
    expect(screen.getByText('Groceries - Tesco')).toBeInTheDocument();
    expect(screen.queryByText('Monthly Salary')).not.toBeInTheDocument();
  });

  it('filters transactions by search query', () => {
    mockLocalStorage.getItem.mockReturnValue(JSON.stringify(mockTransactions));
    render(<TransactionManagement />);

    // Type in search box
    const searchInput = screen.getByPlaceholderText(/search transactions/i) as HTMLInputElement;
    fireEvent.change(searchInput, { target: { value: 'tesco' } });

    // Check if only matching transactions are shown
    expect(screen.getByText('Groceries - Tesco')).toBeInTheDocument();
    expect(screen.queryByText('Monthly Salary')).not.toBeInTheDocument();
  });

  it('resets filters when reset button is clicked', async () => {
    mockLocalStorage.getItem.mockReturnValue(JSON.stringify(mockTransactions));
    render(<TransactionManagement />);

    // Apply a search filter
    const searchInput = screen.getByPlaceholderText(/search transactions/i) as HTMLInputElement;
    fireEvent.change(searchInput, { target: { value: 'tesco' } });

    // Click reset button
    const resetButton = screen.getByRole('button', { name: /reset/i });
    await userEvent.click(resetButton);

    // Check if all transactions are shown again
    expect(screen.getByText('Groceries - Tesco')).toBeInTheDocument();
    expect(screen.getByText('Monthly Salary')).toBeInTheDocument();
    expect(searchInput.value).toBe('');
  });

  it('opens add dialog when add button is clicked', async () => {
    mockLocalStorage.getItem.mockReturnValue(JSON.stringify(mockTransactions));
    render(<TransactionManagement />);

    // Click add button
    const addButton = screen.getByRole('button', { name: /add transaction/i });
    await userEvent.click(addButton);

    // Check if dialog is shown
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('deletes a transaction when delete is confirmed', async () => {
    const mockTransactions = [
      {
        id: '1',
        date: '2024-03-15',
        description: 'Groceries - Tesco',
        merchant: 'Tesco',
        amount: -75.50,
        category: 'Essentials',
        subcategory: 'Groceries',
        budgetMonth: 'current'
      }
    ];

    mockLocalStorage.getItem.mockReturnValue(JSON.stringify(mockTransactions));

    render(<TransactionManagement />);

    // Click delete button
    const deleteButton = screen.getByRole('button', { name: /delete/i });
    fireEvent.click(deleteButton);

    // Click confirm in dialog
    const confirmButton = screen.getByRole('button', { name: /delete/i });
    fireEvent.click(confirmButton);

    // Wait for animation and check if transaction is removed
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 300));
    });

    expect(screen.queryByText('Groceries - Tesco')).not.toBeInTheDocument();
  });

  it('saves transactions to localStorage when they change', () => {
    mockLocalStorage.getItem.mockReturnValue(JSON.stringify(mockTransactions));
    render(<TransactionManagement />);
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith('household-finance-transactions', JSON.stringify(mockTransactions));
  });

  it('opens add dialog and shows correct form fields', async () => {
    render(<TransactionManagement />);
    const addButton = screen.getByRole('button', { name: /add transaction/i });
    await userEvent.click(addButton);
    
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /add transaction/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/amount/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/merchant/i)).toBeInTheDocument();
  });

  describe('Transaction Deletion Functionality', () => {
    it('shows delete confirmation dialog', async () => {
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(mockTransactions));
      render(<TransactionManagement />);
      
      const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
      await userEvent.click(deleteButtons[0]);
      
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: /delete transaction/i })).toBeInTheDocument();
    });

    it('applies animation when deleting a transaction', async () => {
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(mockTransactions));
      render(<TransactionManagement />);
      
      // Wait for transactions to load
      await waitFor(() => {
        expect(screen.getByText('Groceries - Tesco')).toBeInTheDocument();
      });
      
      const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
      await userEvent.click(deleteButtons[0]);
      
      const deleteButton = screen.getByRole('button', { name: /delete/i });
      await userEvent.click(deleteButton);
      
      // Check for animation class
      await waitFor(() => {
        const transactionRow = screen.getByRole('row', { name: /groceries - tesco/i });
        expect(transactionRow).toHaveClass('opacity-0', 'h-0', 'transform', 'scale-95');
      });
      
      // Check that transaction is removed
      await waitFor(() => {
        expect(screen.queryByText('Groceries - Tesco')).not.toBeInTheDocument();
      });
    });
  });
}); 