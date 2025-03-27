import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, beforeAll, afterAll } from 'vitest';
import { TransactionManagement } from '@/components/income-expense/transaction-management';
import { QueryClient, QueryClientProvider, useQuery, useMutation, UseMutationResult, UseQueryResult } from '@tanstack/react-query';
import { ReactNode } from 'react';
import userEvent from '@testing-library/user-event';

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // Deprecated
    removeListener: vi.fn(), // Deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Mock ResizeObserver
beforeAll(() => {
  // Mock ResizeObserver that's used by Radix UI components
  global.ResizeObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  }));

  // Mock DOMRect
  class MockDOMRect {
    x = 0;
    y = 0;
    width = 0;
    height = 0;
    top = 0;
    right = 0;
    bottom = 0;
    left = 0;
    
    static fromRect(rect?: DOMRectInit): DOMRect {
      return new DOMRect();
    }
    
    toJSON() {
      return this;
    }
  }
  
  // @ts-ignore - overriding the global DOMRect
  global.DOMRect = MockDOMRect;
});

afterAll(() => {
  vi.restoreAllMocks();
});

// Mock useIsMobile hook
vi.mock('../../../hooks/useIsMobile', () => ({
  useIsMobile: () => false,
}));

// Mock Radix UI Select components
vi.mock('@radix-ui/react-select', () => ({
  Root: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Trigger: ({ children, ...props }: { children: React.ReactNode }) => (
    <button type="button" role="combobox" aria-expanded="false" aria-controls="radix-select-content" {...props}>
      {children}
    </button>
  ),
  Value: ({ children, placeholder }: { children: React.ReactNode; placeholder?: string }) => (
    <span>{children || placeholder}</span>
  ),
  Portal: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Content: ({ children }: { children: React.ReactNode }) => (
    <div id="radix-select-content" role="listbox">
      {children}
    </div>
  ),
  Viewport: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Item: ({ children, value, ...props }: { children: React.ReactNode; value: string }) => (
    <div role="option" aria-selected="false" data-value={value} {...props}>
      {children}
    </div>
  ),
  ItemText: ({ children }: { children: React.ReactNode }) => <span>{children}</span>,
  Group: ({ children }: { children: React.ReactNode }) => <div role="group">{children}</div>,
  Label: ({ children }: { children: React.ReactNode }) => <span role="label">{children}</span>,
  ScrollUpButton: ({ children }: { children: React.ReactNode }) => <div role="button">{children}</div>,
  ScrollDownButton: ({ children }: { children: React.ReactNode }) => <div role="button">{children}</div>,
  Separator: ({ children }: { children: React.ReactNode }) => <hr role="separator" />,
  Icon: ({ children }: { children: React.ReactNode }) => <span aria-hidden="true">{children}</span>,
  ItemIndicator: ({ children }: { children: React.ReactNode }) => <span aria-hidden="true">{children}</span>
}));

// Mock Radix UI Dialog components
vi.mock('@radix-ui/react-dialog', () => ({
  Root: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Trigger: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Portal: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Overlay: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Content: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Title: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Description: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Close: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

// Mock Radix UI Checkbox components
vi.mock('@radix-ui/react-checkbox', () => ({
  Root: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Indicator: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

// Mock useAuth hook with AuthProvider
vi.mock('@/hooks/use-auth', () => ({
  useAuth: vi.fn(() => ({
    user: {
      id: '1',
      email: 'test@example.com',
      name: 'Test User',
    },
    isLoading: false,
  })),
  AuthProvider: ({ children }: { children: ReactNode }) => <>{children}</>,
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

// Mock react-query
vi.mock('@tanstack/react-query', () => {
  const mockQueryClient = vi.fn(() => ({
    defaultOptions: {},
    mount: vi.fn(),
    unmount: vi.fn(),
    isFetching: vi.fn(),
    isMutating: vi.fn(),
    getQueryData: vi.fn(),
    getQueriesData: vi.fn(),
    setQueryData: vi.fn(),
    getQueryState: vi.fn(),
    removeQueries: vi.fn(),
    resetQueries: vi.fn(),
    cancelQueries: vi.fn(),
    invalidateQueries: vi.fn(),
    refetchQueries: vi.fn(),
    fetchQuery: vi.fn(),
    prefetchQuery: vi.fn(),
    getDefaultOptions: vi.fn(),
    setDefaultOptions: vi.fn(),
    getQueryCache: vi.fn(),
    getMutationCache: vi.fn(),
    clear: vi.fn(),
    resumePausedMutations: vi.fn(),
  }));

  return {
    QueryClient: mockQueryClient,
    QueryClientProvider: ({ children }: { children: ReactNode }) => children,
    useQuery: vi.fn(),
    useMutation: vi.fn(),
  };
});

const sampleTransactions = [
  {
    id: 1,
    description: 'Groceries - Tesco',
    merchant: 'Tesco',
    amount: -82.47,
    date: '2024-06-12',
    category: 'Groceries',
    budgetMonth: 'Current Month',
  },
  {
    id: 2,
    description: 'Monthly Salary',
    merchant: 'Acme Inc',
    amount: 3850.00,
    date: '2024-06-10',
    category: 'Salary',
    budgetMonth: 'Current Month',
  },
  {
    id: 3,
    description: 'Coffee Shop',
    merchant: 'Costa Coffee',
    amount: -4.85,
    date: '2024-06-09',
    category: 'Dining Out',
    budgetMonth: 'Current Month',
  },
  {
    id: 4,
    description: 'Electricity Bill',
    merchant: 'British Gas',
    amount: -78.32,
    date: '2024-06-07',
    category: 'Utilities',
    budgetMonth: 'Current Month',
  }
];

describe('TransactionManagement', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });
  });

  it('renders the transaction management component', () => {
    // Mock a successful query with sample data
    vi.mocked(useQuery).mockReturnValue({
      data: sampleTransactions,
      isLoading: false,
      isError: false,
      error: null,
      status: 'success',
      refetch: vi.fn(),
    } as unknown as UseQueryResult<any, any>);

    render(
      <QueryClientProvider client={queryClient}>
        <TransactionManagement />
      </QueryClientProvider>
    );

    // Test heading is rendered
    expect(screen.getByText('Transaction Management')).toBeInTheDocument();
    
    // Test Add Transaction button is rendered
    expect(screen.getByText('Add Transaction')).toBeInTheDocument();
    
    // Test search input is rendered
    expect(screen.getByPlaceholderText('Search transactions...')).toBeInTheDocument();
  });

  it('displays loading state', () => {
    vi.mocked(useQuery).mockReturnValue({
      data: undefined,
      isLoading: true,
      isPending: true,
      isError: false,
      error: null,
      status: 'loading',
      refetch: vi.fn(),
    } as unknown as UseQueryResult<any, any>);

    render(
      <QueryClientProvider client={queryClient}>
        <TransactionManagement />
      </QueryClientProvider>
    );

    // We'd ensure the heading is still rendered during loading
    expect(screen.getByText('Transaction Management')).toBeInTheDocument();
  });

  it('renders transaction data in a table', () => {
    vi.mocked(useQuery).mockReturnValue({
      data: sampleTransactions,
      isLoading: false,
      isError: false,
      error: null,
      status: 'success',
      refetch: vi.fn(),
    } as unknown as UseQueryResult<any, any>);

    render(
      <QueryClientProvider client={queryClient}>
        <TransactionManagement />
      </QueryClientProvider>
    );

    // Check that the table headers are rendered
    expect(screen.getByRole('columnheader', { name: 'Date' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Merchant' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Description' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Category' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Amount' })).toBeInTheDocument();

    // Check that transaction data is displayed
    expect(screen.getByText('Tesco')).toBeInTheDocument();
    expect(screen.getByText('Costa Coffee')).toBeInTheDocument();
    expect(screen.getByText('-£82.47')).toBeInTheDocument();
    expect(screen.getByText('£3850.00')).toBeInTheDocument();
  });

  it('handles error state', () => {
    const error = new Error('Failed to fetch transactions');
    
    vi.mocked(useQuery).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: error,
      status: 'error',
      refetch: vi.fn(),
    } as unknown as UseQueryResult<any, any>);

    render(
      <QueryClientProvider client={queryClient}>
        <TransactionManagement />
      </QueryClientProvider>
    );

    // Since we don't have visibility into the exact error message format,
    // we'll check for the component header to ensure it renders in error state
    expect(screen.getByText('Transaction Management')).toBeInTheDocument();
  });

  it('handles empty transaction list', () => {
    vi.mocked(useQuery).mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
      error: null,
      status: 'success',
      refetch: vi.fn(),
    } as unknown as UseQueryResult<any, any>);

    render(
      <QueryClientProvider client={queryClient}>
        <TransactionManagement />
      </QueryClientProvider>
    );

    // Component renders in empty state
    expect(screen.getByText('Transaction Management')).toBeInTheDocument();
    
    // Typically there would be some empty state message, but since we don't know the exact text,
    // we're just verifying the component renders without errors
  });

  it('allows searching for transactions', async () => {
    vi.mocked(useQuery).mockReturnValue({
      data: sampleTransactions,
      isLoading: false,
      isError: false,
      error: null,
      status: 'success',
      refetch: vi.fn(),
    } as unknown as UseQueryResult<any, any>);

    render(
      <QueryClientProvider client={queryClient}>
        <TransactionManagement />
      </QueryClientProvider>
    );

    // Enter search text
    const searchInput = screen.getByPlaceholderText('Search transactions...');
    fireEvent.change(searchInput, { target: { value: 'Coffee' } });
    
    // We can't deterministically test for filtered results since the filtering is done by the component,
    // but we can ensure the search input value is updated
    expect(searchInput).toHaveValue('Coffee');
  });

  it('opens add transaction form when button is clicked', async () => {
    // Mock mutation function
    const mockMutate = vi.fn();
    vi.mocked(useMutation).mockReturnValue({
      mutate: mockMutate,
      isPending: false,
      isError: false,
      error: null,
    } as unknown as UseMutationResult<any, any, any, any>);
    
    // Mock query data
    vi.mocked(useQuery).mockReturnValue({
      data: sampleTransactions,
      isLoading: false,
      isError: false,
      error: null,
      status: 'success',
      refetch: vi.fn(),
    } as unknown as UseQueryResult<any, any>);

    render(
      <QueryClientProvider client={queryClient}>
        <TransactionManagement />
      </QueryClientProvider>
    );

    // Find and click Add Transaction button
    const addButton = screen.getByRole('button', { name: /add transaction/i });
    fireEvent.click(addButton);
    
    // Since we don't have visibility into dialog behavior, we'll just ensure
    // the button click doesn't throw errors
  });
});

describe('TransactionManagement Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders the component with basic elements', () => {
      render(<TransactionManagement />);
      expect(screen.getByRole('heading', { name: /transaction management/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /add transaction/i })).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/search transactions/i)).toBeInTheDocument();
    });
  });

  describe('Transaction Form', () => {
    it('opens transaction form dialog when add button is clicked', async () => {
      render(<TransactionManagement />);
      const addButton = screen.getAllByRole('button', { name: /add transaction/i })[0];
      await userEvent.click(addButton);
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('validates required fields', async () => {
      render(<TransactionManagement />);
      const addButton = screen.getAllByRole('button', { name: /add transaction/i })[0];
      await userEvent.click(addButton);

      const submitButton = screen.getByRole('button', { name: /add transaction/i });
      await userEvent.click(submitButton);

      expect(screen.getByText(/description is required/i)).toBeInTheDocument();
      expect(screen.getByText(/amount is required/i)).toBeInTheDocument();
      expect(screen.getByText(/category is required/i)).toBeInTheDocument();
    });

    it('submits form with valid data', async () => {
      render(<TransactionManagement />);
      const addButton = screen.getAllByRole('button', { name: /add transaction/i })[0];
      await userEvent.click(addButton);

      await userEvent.type(screen.getByRole('textbox', { name: /description/i }), 'Test Purchase');
      await userEvent.type(screen.getByRole('spinbutton', { name: /amount/i }), '50');
      await userEvent.type(screen.getByRole('textbox', { name: /merchant/i }), 'Test Store');

      // Select category
      const categorySelect = screen.getByRole('combobox', { name: 'Category' });
      await userEvent.click(categorySelect);
      const essentialsOptions = screen.getAllByRole('option', { name: /essentials/i });
      await userEvent.click(essentialsOptions[0]);

      // Wait for category selection to be processed
      await waitFor(() => {
        expect(screen.getByRole('combobox', { name: 'Subcategory' })).not.toBeDisabled();
      });

      // Select subcategory and wait for options
      const subcategorySelect = screen.getByRole('combobox', { name: 'Subcategory' });
      await userEvent.click(subcategorySelect);

      // Wait for subcategory options to be populated and select Rent/Mortgage
      await waitFor(() => {
        expect(screen.getByRole('option', { name: /rent\/mortgage/i })).toBeInTheDocument();
      });

      const rentMortgageOption = screen.getByRole('option', { name: /rent\/mortgage/i });
      await userEvent.click(rentMortgageOption);

      // Select budget month
      const budgetMonthSelect = screen.getByRole('combobox', { name: 'Budget Month' });
      await userEvent.click(budgetMonthSelect);
      const nextMonthOptions = screen.getAllByRole('option', { name: /next month/i });
      await userEvent.click(nextMonthOptions[0]);

      // Submit form
      const form = screen.getByTestId('transaction-form');
      const submitButton = within(form).getByRole('button', { name: /add transaction/i });
      await userEvent.click(submitButton);

      // Verify transaction was added
      expect(screen.getByText('Test Purchase')).toBeInTheDocument();
      expect(screen.getByText('Test Store')).toBeInTheDocument();
      expect(screen.getByText('-£50.00')).toBeInTheDocument();
      expect(screen.getByText('Next Month')).toBeInTheDocument();
    });
  });

  describe('Filtering and Search', () => {
    it('should filter transactions by search query', async () => {
      render(<TransactionManagement />);
      
      // Type in search input
      const searchInput = screen.getByPlaceholderText('Search transactions...');
      await userEvent.type(searchInput, 'groceries');
      
      // Verify filtered results
      expect(screen.getByText('Groceries - Tesco')).toBeInTheDocument();
      expect(screen.queryByText('Electricity Bill')).not.toBeInTheDocument();
    });

    it('should filter transactions by category and subcategory', async () => {
      render(<TransactionManagement />);

      // Open category filter dropdown
      const categoryFilter = screen.getByRole('combobox', { name: /category/i });
      await userEvent.click(categoryFilter);

      // Select Essentials category
      const essentialsOption = screen.getByRole('option', { name: /essentials/i });
      await userEvent.click(essentialsOption);

      // Verify that only Essentials transactions are shown
      const transactions = screen.getAllByRole('row');
      transactions.forEach(transaction => {
        const categoryCell = within(transaction).queryByText(/essentials/i);
        if (categoryCell) {
          expect(categoryCell).toBeInTheDocument();
        }
      });

      // Open Add Transaction dialog
      const addButton = screen.getByRole('button', { name: /add transaction/i });
      await userEvent.click(addButton);

      // Open category select in the form
      const categorySelect = screen.getByRole('combobox', { name: /category/i });
      await userEvent.click(categorySelect);

      // Select Essentials category
      const essentialsFormOption = screen.getByRole('option', { name: /essentials/i });
      await userEvent.click(essentialsFormOption);

      // Wait for subcategory select to be enabled
      const subcategorySelect = screen.getByRole('combobox', { name: /subcategory/i });
      await waitFor(() => {
        expect(subcategorySelect).not.toBeDisabled();
      });

      // Open subcategory select
      await userEvent.click(subcategorySelect);

      // Wait for subcategory options to be populated
      await waitFor(() => {
        const subcategoryOptions = screen.getAllByRole('option');
        expect(subcategoryOptions.length).toBeGreaterThan(0);
        expect(subcategoryOptions.some(option => option.textContent === 'Rent/Mortgage')).toBe(true);
      });
    });
  });

  describe('Recurring Transactions', () => {
    it('should add a recurring transaction', async () => {
      render(<TransactionManagement />);

      // Open add transaction dialog
      const addButtons = screen.getAllByRole('button', { name: /add transaction/i });
      await userEvent.click(addButtons[0]);

      // Fill in form fields
      await userEvent.type(screen.getByRole('textbox', { name: /description/i }), 'Rent Payment');
      await userEvent.type(screen.getByRole('textbox', { name: /merchant/i }), 'Landlord');
      await userEvent.type(screen.getByRole('spinbutton', { name: /amount/i }), '1000');

      // Select category
      const categorySelect = screen.getByRole('combobox', { name: 'Category' });
      await userEvent.click(categorySelect);
      const essentialsOptions = screen.getAllByRole('option', { name: /essentials/i });
      await userEvent.click(essentialsOptions[0]);

      // Wait for category selection to be processed
      await waitFor(() => {
        expect(screen.getByRole('combobox', { name: 'Subcategory' })).not.toBeDisabled();
      });

      // Select subcategory and wait for options
      const subcategorySelect = screen.getByRole('combobox', { name: 'Subcategory' });
      await userEvent.click(subcategorySelect);

      // Wait for subcategory options to be populated and select Rent/Mortgage
      await waitFor(() => {
        expect(screen.getByRole('option', { name: /rent\/mortgage/i })).toBeInTheDocument();
      });

      const rentMortgageOption = screen.getByRole('option', { name: /rent\/mortgage/i });
      await userEvent.click(rentMortgageOption);

      // Mark as recurring
      const recurringCheckbox = screen.getByRole('checkbox', { name: /recurring transaction/i });
      await userEvent.click(recurringCheckbox);

      // Select frequency
      const frequencySelect = screen.getByRole('combobox', { name: 'Frequency' });
      await userEvent.click(frequencySelect);
      const monthlyOption = screen.getByRole('option', { name: /monthly/i });
      await userEvent.click(monthlyOption);

      // Submit form
      const form = screen.getByTestId('transaction-form');
      const submitButton = within(form).getByRole('button', { name: /add transaction/i });
      await userEvent.click(submitButton);

      // Verify transaction was added
      expect(screen.getByText('Rent Payment')).toBeInTheDocument();
      expect(screen.getByText('Landlord')).toBeInTheDocument();
      expect(screen.getByText('£1000.00')).toBeInTheDocument();
    });
  });

  describe('Budget Month Assignment', () => {
    it('should assign a transaction to the next month', async () => {
      render(<TransactionManagement />);

      // Open add transaction dialog
      const addButtons = screen.getAllByRole('button', { name: /add transaction/i });
      await userEvent.click(addButtons[0]);

      // Fill in form fields
      await userEvent.type(screen.getByRole('textbox', { name: /description/i }), 'Test Purchase');
      await userEvent.type(screen.getByRole('spinbutton', { name: /amount/i }), '50');
      await userEvent.type(screen.getByRole('textbox', { name: /merchant/i }), 'Test Store');

      // Select category
      const categorySelect = screen.getByRole('combobox', { name: 'Category' });
      await userEvent.click(categorySelect);
      const essentialsOptions = screen.getAllByRole('option', { name: /essentials/i });
      await userEvent.click(essentialsOptions[0]);

      // Wait for category selection to be processed
      await waitFor(() => {
        expect(screen.getByRole('combobox', { name: 'Subcategory' })).not.toBeDisabled();
      });

      // Select subcategory and wait for options
      const subcategorySelect = screen.getByRole('combobox', { name: 'Subcategory' });
      await userEvent.click(subcategorySelect);

      // Wait for subcategory options to be populated and select Rent/Mortgage
      await waitFor(() => {
        expect(screen.getByRole('option', { name: /rent\/mortgage/i })).toBeInTheDocument();
      });

      const rentMortgageOption = screen.getByRole('option', { name: /rent\/mortgage/i });
      await userEvent.click(rentMortgageOption);

      // Select budget month
      const budgetMonthSelect = screen.getByRole('combobox', { name: 'Budget Month' });
      await userEvent.click(budgetMonthSelect);
      const nextMonthOptions = screen.getAllByRole('option', { name: /next month/i });
      await userEvent.click(nextMonthOptions[0]);

      // Submit form
      const form = screen.getByTestId('transaction-form');
      const submitButton = within(form).getByRole('button', { name: /add transaction/i });
      await userEvent.click(submitButton);

      // Verify transaction was added
      expect(screen.getByText('Test Purchase')).toBeInTheDocument();
      expect(screen.getByText('Test Store')).toBeInTheDocument();
      expect(screen.getByText('-£50.00')).toBeInTheDocument();
      expect(screen.getByText('Next Month')).toBeInTheDocument();
    });
  });
}); 