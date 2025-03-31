import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TransactionManagement } from '@/components/income-expense/transaction-management';
import { renderWithProviders, setupMocks } from '../../test-utils';

// Mock transaction data
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
    
    // Setup standard mocks
    setupMocks({
      authState: {
        user: {
          id: 1,
          name: 'Test User',
          email: 'test@example.com',
          username: 'testuser',
          password: 'password123',
          createdAt: new Date(),
          role: 'user'
        },
        isAuthenticated: true
      },
      isMobile: false,
      apiResponses: [
        {
          endpoint: '/api/transactions',
          method: 'GET',
          response: mockTransactions
        }
      ],
      queryData: {
        '/api/transactions': mockTransactions
      }
    });
    
    // Mock localStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: vi.fn(() => null),
        setItem: vi.fn(),
        clear: vi.fn(),
      },
    });
  });

  it('displays loading state initially', async () => {
    // Override with loading state
    setupMocks({
      queryData: {
        '/api/transactions': {
          isLoading: true,
          data: null
        }
      }
    });
    
    const { user } = renderWithProviders(<TransactionManagement />);
    
    // Check for loading indicator
    expect(screen.getByText(/loading transactions/i)).toBeInTheDocument();
  });

  it('shows empty state when no transactions are found', async () => {
    // Override with empty data
    setupMocks({
      queryData: {
        '/api/transactions': []
      }
    });
    
    const { user } = renderWithProviders(<TransactionManagement />);
    
    // Check for empty state message
    await waitFor(() => {
      expect(screen.getByText(/no transactions found/i)).toBeInTheDocument();
    });
    
    // Should have reset filters button
    expect(screen.getByText(/clear filters/i)).toBeInTheDocument();
  });

  it('loads and displays transactions', async () => {
    const { user } = renderWithProviders(<TransactionManagement />);
    
    // Wait for transactions to be displayed
    await waitFor(() => {
      // Check if transactions are displayed
      expect(screen.getByText('Groceries - Tesco')).toBeInTheDocument();
      expect(screen.getByText('Monthly Salary')).toBeInTheDocument();
      
      // Check amounts are formatted correctly
      expect(screen.getByText('-$75.50')).toBeInTheDocument();
      expect(screen.getByText('$3,000.00')).toBeInTheDocument();
    });
  });

  it('filters transactions by category', async () => {
    const { user } = renderWithProviders(<TransactionManagement />);
    
    // Wait for transactions to be displayed
    await waitFor(() => {
      expect(screen.getByText('Groceries - Tesco')).toBeInTheDocument();
    });
    
    // Open category filter
    const categoryFilter = screen.getByRole('combobox', { name: /all categories/i });
    await user.click(categoryFilter);
    
    // Select Essentials category
    const essentialsOption = screen.getByRole('option', { name: /essentials/i });
    await user.click(essentialsOption);
    
    // Check that only Essentials transactions are shown
    await waitFor(() => {
      expect(screen.getByText('Groceries - Tesco')).toBeInTheDocument();
      expect(screen.queryByText('Monthly Salary')).not.toBeInTheDocument();
    });
  });

  it('filters transactions by search query', async () => {
    const { user } = renderWithProviders(<TransactionManagement />);
    
    // Wait for transactions to be displayed
    await waitFor(() => {
      expect(screen.getByText('Groceries - Tesco')).toBeInTheDocument();
    });
    
    // Type in search box
    const searchInput = screen.getByPlaceholderText(/search transactions/i);
    await user.type(searchInput, 'tesco');
    
    // Check if only matching transactions are shown
    await waitFor(() => {
      expect(screen.getByText('Groceries - Tesco')).toBeInTheDocument();
      expect(screen.queryByText('Monthly Salary')).not.toBeInTheDocument();
    });
  });

  it('resets filters when reset button is clicked', async () => {
    const { user } = renderWithProviders(<TransactionManagement />);
    
    // Wait for transactions to be displayed
    await waitFor(() => {
      expect(screen.getByText('Groceries - Tesco')).toBeInTheDocument();
    });
    
    // Apply a search filter
    const searchInput = screen.getByPlaceholderText(/search transactions/i);
    await user.type(searchInput, 'tesco');
    
    // Check that filter is applied
    await waitFor(() => {
      expect(screen.queryByText('Monthly Salary')).not.toBeInTheDocument();
    });
    
    // Click reset button
    const resetButton = screen.getByRole('button', { name: /reset/i });
    await user.click(resetButton);
    
    // Check if all transactions are shown again
    await waitFor(() => {
      expect(screen.getByText('Groceries - Tesco')).toBeInTheDocument();
      expect(screen.getByText('Monthly Salary')).toBeInTheDocument();
    });
    
    // Search input should be cleared
    expect(searchInput).toHaveValue('');
  });
}); 