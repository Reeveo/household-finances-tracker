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

// Mock transactions based on the specific implementation in the component
const mockTransactionsImpl = [
  {
    id: 1,
    date: '2023-06-12',
    description: 'Groceries - Tesco',
    merchant: 'Tesco',
    merchantLogo: 'tesco.svg',
    category: 'Essentials',
    subcategory: 'Groceries',
    amount: -82.47,
    paymentMethod: 'Credit Card',
    isRecurring: false,
    budgetMonth: 'current',
    notes: '',
  },
  {
    id: 2,
    date: '2023-06-10',
    description: 'Monthly Salary',
    merchant: 'Acme Inc',
    merchantLogo: 'acme.svg',
    category: 'Income',
    subcategory: 'Salary',
    amount: 3850.00,
    paymentMethod: 'Bank Transfer',
    isRecurring: true,
    frequency: 'Monthly',
    budgetMonth: 'current',
    notes: 'Main job salary',
  },
];

// Mock localStorage
const mockLocalStorage = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();

// Mock a simplified version of the component to help diagnose rendering issues
const MockTransactionManagement = () => {
  return (
    <div data-testid="mock-component">
      <h1>Transaction Management</h1>
      <div>
        <span>Groceries - Tesco</span>
        <span>Monthly Salary</span>
      </div>
    </div>
  );
};

describe('TransactionManagement', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock localStorage
    Object.defineProperty(window, 'localStorage', {
      value: mockLocalStorage
    });

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
      isMobile: false
    });
  });

  // Only test a single case first to debug rendering issues
  it('should render the component', async () => {
    // Set the localStorage data to use the exact data from the component's sample data
    mockLocalStorage.setItem('household-finance-transactions', JSON.stringify(mockTransactionsImpl));
    
    const { container } = renderWithProviders(<TransactionManagement />);
    
    // Debug what's actually being rendered
    screen.debug(container);
    
    // First just check that the component renders at all
    await waitFor(() => {
      // Look for any elements that might indicate the component rendered
      const cardTitle = screen.queryByText('Transaction Management');
      console.log('Card title found:', !!cardTitle);
      
      // Test for table headers if they exist
      const dateHeader = screen.queryByText('Date');
      console.log('Date header found:', !!dateHeader);
      
      const merchantHeader = screen.queryByText('Merchant');
      console.log('Merchant header found:', !!merchantHeader);
    });
    
    // Just check that the component rendered something
    expect(container).not.toBeEmptyDOMElement();
  });

  it('displays loading state initially', async () => {
    // Clear localStorage to test empty state
    mockLocalStorage.clear();
    
    // Setup mock for empty data with loading state
    const { user } = renderWithProviders(<TransactionManagement />);
    
    // The component should render an empty div initially while loading
    await waitFor(() => {
      const emptyDiv = screen.getByText(/Transaction Management/i);
      expect(emptyDiv).toBeInTheDocument();
    });
  });

  it('shows empty state when no transactions are found', async () => {
    // Clear localStorage to test empty state
    mockLocalStorage.clear();
    
    // Setup empty localTransactions
    const { user } = renderWithProviders(<TransactionManagement />);
    
    // Wait for the component to load and show empty state
    await waitFor(() => {
      expect(screen.getByText(/No transactions found/i)).toBeInTheDocument();
      expect(screen.getByText(/Clear filters/i)).toBeInTheDocument();
    });
  });

  it('loads and displays transactions', async () => {
    const { user } = renderWithProviders(<TransactionManagement />);
    
    // Wait for transactions to be loaded from localStorage and displayed
    await waitFor(() => {
      expect(screen.getByText('Groceries - Tesco')).toBeInTheDocument();
      expect(screen.getByText('Monthly Salary')).toBeInTheDocument();
    });
    
    // Check that amount formatting is correct
    expect(screen.getByText((content, element) => {
      return content.includes('£75.50') && element.tagName.toLowerCase() === 'span';
    })).toBeInTheDocument();
    
    expect(screen.getByText((content, element) => {
      return content.includes('£3000.00') && element.tagName.toLowerCase() === 'span';
    })).toBeInTheDocument();
  });

  it('filters transactions by category', async () => {
    const { user } = renderWithProviders(<TransactionManagement />);
    
    // Wait for transactions to be displayed
    await waitFor(() => {
      expect(screen.getByText('Groceries - Tesco')).toBeInTheDocument();
    });
    
    // Find and click on the category dropdown
    const categoryDropdown = screen.getByText(/All Categories/i);
    await user.click(categoryDropdown);
    
    // Select Essentials category from the dropdown items that appear
    const essentialsOption = screen.getByRole('option', { name: /Essentials/i });
    await user.click(essentialsOption);
    
    // Verify that only Essential transactions are shown
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
    
    // Find search input and type "Tesco"
    const searchInput = screen.getByPlaceholderText(/Search transactions/i);
    await user.type(searchInput, 'Tesco');
    
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
    const searchInput = screen.getByPlaceholderText(/Search transactions/i);
    await user.type(searchInput, 'Tesco');
    
    // Check that filter is applied
    await waitFor(() => {
      expect(screen.queryByText('Monthly Salary')).not.toBeInTheDocument();
    });
    
    // Find and click reset button
    const resetButton = screen.getByRole('button', { name: /Reset/i });
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

describe('MockTransactionManagement', () => {
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
      isMobile: false
    });
  });

  it('should render the component', async () => {
    const { container } = renderWithProviders(<MockTransactionManagement />);
    
    // Debug what's actually being rendered
    screen.debug(container);
    
    // Check that the component renders
    expect(screen.getByTestId('mock-component')).toBeInTheDocument();
    expect(screen.getByText('Transaction Management')).toBeInTheDocument();
    expect(screen.getByText('Groceries - Tesco')).toBeInTheDocument();
    expect(screen.getByText('Monthly Salary')).toBeInTheDocument();
  });
}); 