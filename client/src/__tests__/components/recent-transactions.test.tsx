import { vi, describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { RecentTransactions } from '@/components/dashboard/recent-transactions';
import { renderWithProviders } from '../test-utils';
import { QueryClient } from '@tanstack/react-query';

// Mock the useAuth hook
vi.mock('@/hooks/use-auth', () => ({
  useAuth: () => ({
    user: { id: 1, username: 'testuser' }
  })
}));

// Mock the useToast hook
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn()
  })
}));

// Sample data for tests
const mockTransactions = [
  {
    id: 1,
    date: '2023-05-25',
    description: 'Salary Payment',
    amount: '1500.00',
    category: 'Income',
    subcategory: 'Salary',
    paymentMethod: 'Bank Transfer',
    merchant: 'ACME Inc.',
    userId: 1,
    type: 'income',
    createdAt: new Date()
  },
  {
    id: 2,
    date: '2023-05-28',
    description: 'Grocery Shopping',
    amount: '-75.50',
    category: 'Essentials',
    subcategory: 'Groceries',
    paymentMethod: 'Debit Card',
    merchant: 'Tesco',
    userId: 1,
    type: 'expense',
    createdAt: new Date()
  },
  {
    id: 3,
    date: '2023-05-30',
    description: 'Coffee Shop',
    amount: '-4.95',
    category: 'Lifestyle',
    subcategory: 'Dining Out',
    paymentMethod: 'Credit Card',
    merchant: 'Starbucks',
    userId: 1,
    type: 'expense',
    createdAt: new Date()
  }
];

describe('RecentTransactions Component', () => {
  let queryClient: QueryClient;
  
  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });
    
    // Set up mock data
    queryClient.setQueryData(['/api/transactions'], mockTransactions);
  });

  it('renders the component with recent transactions', async () => {
    renderWithProviders(<RecentTransactions />, { queryClient });
    
    // Check if the title is rendered
    expect(screen.getByText(/Recent Transactions/i)).toBeInTheDocument();
    
    // Wait for transactions to be displayed
    await waitFor(() => {
      // Check if transactions are displayed
      expect(screen.getByText('Salary Payment')).toBeInTheDocument();
      expect(screen.getByText('Grocery Shopping')).toBeInTheDocument();
      expect(screen.getByText('Coffee Shop')).toBeInTheDocument();
    });
    
    // Check if amounts are formatted correctly
    expect(screen.getByText('£1,500.00')).toBeInTheDocument();
    expect(screen.getByText('-£75.50')).toBeInTheDocument();
    expect(screen.getByText('-£4.95')).toBeInTheDocument();
  });

  it('displays loading state when data is loading', async () => {
    // Create a new query client with no data to simulate loading
    const emptyQueryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
          enabled: false, // Disable auto-fetching
        },
      },
    });
    
    renderWithProviders(<RecentTransactions />, { queryClient: emptyQueryClient });
    
    // Check for loading state
    expect(screen.getByText(/Loading transactions/i)).toBeInTheDocument();
    expect(screen.queryByText('Salary Payment')).not.toBeInTheDocument();
  });

  it('displays empty state when no transactions exist', async () => {
    // Create a query client with empty transactions array
    const emptyQueryClient = new QueryClient();
    emptyQueryClient.setQueryData(['/api/transactions'], []);
    
    renderWithProviders(<RecentTransactions />, { queryClient: emptyQueryClient });
    
    // Wait for empty state to be displayed
    await waitFor(() => {
      expect(screen.getByText(/No transactions found/i)).toBeInTheDocument();
      expect(screen.getByText(/Add your first transaction/i)).toBeInTheDocument();
      expect(screen.queryByText('Salary Payment')).not.toBeInTheDocument();
    });
  });

  it('displays error state when fetch fails', async () => {
    // Create a query client that will throw an error
    const errorQueryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });
    
    // Set an error for the query
    errorQueryClient.setQueryData(['/api/transactions'], () => {
      throw new Error('Failed to fetch transactions');
    });
    
    renderWithProviders(<RecentTransactions />, { queryClient: errorQueryClient });
    
    // Wait for error state to be displayed
    await waitFor(() => {
      expect(screen.getByText(/Error loading transactions/i)).toBeInTheDocument();
      expect(screen.queryByText('Salary Payment')).not.toBeInTheDocument();
    });
  });

  it('shows correct styling for income and expense transactions', async () => {
    renderWithProviders(<RecentTransactions />, { queryClient });
    
    await waitFor(() => {
      // Check for transaction elements
      const transactions = screen.getAllByTestId('transaction-item');
      expect(transactions.length).toBe(3);
      
      // First transaction should have income styling (green text or similar)
      const incomeAmount = screen.getByText('£1,500.00');
      expect(incomeAmount.closest('[data-testid="transaction-amount"]')).toHaveClass('text-green-600');
      
      // Second transaction should have expense styling (red text or similar)
      const expenseAmount = screen.getByText('-£75.50');
      expect(expenseAmount.closest('[data-testid="transaction-amount"]')).toHaveClass('text-red-600');
    });
  });

  it('handles click on view all transactions button', async () => {
    const navigateMock = vi.fn();
    vi.mock('wouter', () => ({
      useLocation: () => ['/'],
      useRoute: () => [false],
      Link: ({ children }: any) => children,
      navigate: navigateMock
    }));
    
    renderWithProviders(<RecentTransactions />, { queryClient });
    
    // Find and click the view all button
    const viewAllButton = screen.getByText(/View All/i);
    fireEvent.click(viewAllButton);
    
    // Check if navigation function was called
    await waitFor(() => {
      expect(navigateMock).toHaveBeenCalledWith('/transactions');
    });
  });
});