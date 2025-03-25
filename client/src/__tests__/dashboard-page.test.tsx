import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import DashboardPage from '../pages/dashboard-page';
import { useAuth } from '@/hooks/use-auth';
import { useQuery } from '@tanstack/react-query';
import { renderWithProviders } from './test-utils';

// Mock the hooks
vi.mock('@/hooks/use-auth', () => ({
  useAuth: vi.fn(),
}));

vi.mock('@tanstack/react-query', () => ({
  useQuery: vi.fn(),
}));

// Mock components used in the dashboard page
vi.mock('@/components/dashboard/dashboard-summary', () => ({
  DashboardSummary: ({ data, loading, error }: any) => (
    <div data-testid="dashboard-summary">
      {loading ? 'Loading...' : null}
      {error ? `Error: ${error}` : null}
      {data ? 'Dashboard Summary Data' : null}
    </div>
  ),
}));

vi.mock('@/components/dashboard/recent-transactions', () => ({
  RecentTransactions: () => <div data-testid="recent-transactions">Recent Transactions</div>,
}));

vi.mock('@/components/dashboard/upcoming-bills', () => ({
  UpcomingBills: () => <div data-testid="upcoming-bills">Upcoming Bills</div>,
}));

vi.mock('@/components/dashboard/budget-progress', () => ({
  BudgetProgress: () => <div data-testid="budget-progress">Budget Progress</div>,
}));

vi.mock('@/components/layout/sidebar', () => ({
  Sidebar: () => <div data-testid="sidebar">Sidebar</div>,
}));

vi.mock('@/components/layout/header', () => ({
  Header: () => <div data-testid="header">Header</div>,
}));

describe('DashboardPage', () => {
  const mockUser = { 
    id: 1, 
    name: 'Test User', 
    email: 'test@example.com' 
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock authenticated user
    (useAuth as any).mockReturnValue({ 
      user: mockUser,
      isAuthenticated: true
    });
  });

  it('renders the dashboard page with all components', async () => {
    // Mock successful data loading
    (useQuery as any).mockReturnValue({
      data: {
        totalIncome: 5000,
        totalExpenses: 3000,
        netSavings: 2000,
        incomeByCategory: [],
        expensesByCategory: [],
        savingsRate: 40,
        monthlyChange: 10,
      },
      isLoading: false,
      isError: false,
      error: null,
    });

    render(<DashboardPage />);
    
    // Check if all dashboard components are rendered
    expect(screen.getByTestId('dashboard-summary')).toBeInTheDocument();
    expect(screen.getByTestId('recent-transactions')).toBeInTheDocument();
    expect(screen.getByTestId('upcoming-bills')).toBeInTheDocument();
    expect(screen.getByTestId('budget-progress')).toBeInTheDocument();
    
    // Check for layout components
    expect(screen.getByTestId('sidebar')).toBeInTheDocument();
    expect(screen.getByTestId('header')).toBeInTheDocument();
    
    // Check for dashboard title
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });

  it('handles loading state correctly', async () => {
    // Mock loading state
    (useQuery as any).mockReturnValue({
      data: null,
      isLoading: true,
      isError: false,
      error: null,
    });

    render(<DashboardPage />);
    
    // The dashboard summary should show loading state
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('handles error state correctly', async () => {
    // Mock error state
    (useQuery as any).mockReturnValue({
      data: null,
      isLoading: false,
      isError: true,
      error: 'Failed to load dashboard data',
    });

    render(<DashboardPage />);
    
    // The dashboard summary should show error state
    expect(screen.getByText('Error: Failed to load dashboard data')).toBeInTheDocument();
  });

  it('redirects unauthenticated users', async () => {
    // Mock unauthenticated user
    (useAuth as any).mockReturnValue({ 
      user: null,
      isAuthenticated: false
    });
    
    // Mock navigate function to test redirection
    const mockNavigate = vi.fn();
    vi.mock('wouter', () => ({
      useLocation: () => ['/dashboard'],
      useNavigate: () => mockNavigate,
    }));

    render(<DashboardPage />);
    
    // Should attempt to redirect to login page
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/auth');
    });
  });

  it('fetches data with the correct parameters', async () => {
    // Create a mock for the useQuery hook that captures the query key
    let capturedQueryKey: any;
    (useQuery as any).mockImplementation((queryKey, options) => {
      capturedQueryKey = queryKey;
      return {
        data: {
          totalIncome: 5000,
          totalExpenses: 3000,
          netSavings: 2000,
          incomeByCategory: [],
          expensesByCategory: [],
          savingsRate: 40,
          monthlyChange: 10,
        },
        isLoading: false,
        isError: false,
        error: null,
      };
    });

    render(<DashboardPage />);
    
    // Verify the query key includes the user ID for proper caching
    expect(capturedQueryKey).toContain('dashboardSummary');
    expect(capturedQueryKey).toContain(mockUser.id);
  });

  it('uses the default time period for data fetching', async () => {
    // Create a mock for the useQuery hook that captures the fetchFn
    let capturedFetchFn: any;
    (useQuery as any).mockImplementation((queryKey, options) => {
      capturedFetchFn = options.queryFn;
      return {
        data: null,
        isLoading: true,
        isError: false,
        error: null,
      };
    });

    // Mock apiRequest function
    const mockApiRequest = vi.fn();
    vi.mock('@/lib/queryClient', () => ({
      apiRequest: mockApiRequest,
    }));

    render(<DashboardPage />);
    
    // Execute the captured fetch function
    capturedFetchFn();
    
    // Verify API call parameters
    expect(mockApiRequest).toHaveBeenCalledWith(
      'GET',
      '/api/dashboard/summary',
      expect.objectContaining({
        period: 'month', // Default period
      })
    );
  });

  it('handles different time periods for data display', async () => {
    // Mock successful data loading
    (useQuery as any).mockReturnValue({
      data: {
        totalIncome: 5000,
        totalExpenses: 3000,
        netSavings: 2000,
        incomeByCategory: [],
        expensesByCategory: [],
        savingsRate: 40,
        monthlyChange: 10,
      },
      isLoading: false,
      isError: false,
      error: null,
    });

    render(<DashboardPage />);
    
    // Check for time period selector
    expect(screen.getByText('This Month')).toBeInTheDocument();
    
    // Change time period to 'quarter'
    const timeSelector = screen.getByRole('combobox');
    fireEvent.change(timeSelector, { target: { value: 'quarter' } });
    
    // Should refetch with new period
    await waitFor(() => {
      expect(mockApiRequest).toHaveBeenCalledWith(
        'GET',
        '/api/dashboard/summary',
        expect.objectContaining({
          period: 'quarter',
        })
      );
    });
  });

  it('updates data when refresh button is clicked', async () => {
    // Mock the refetch function
    const mockRefetch = vi.fn();
    (useQuery as any).mockReturnValue({
      data: {
        totalIncome: 5000,
        totalExpenses: 3000,
        netSavings: 2000,
        incomeByCategory: [],
        expensesByCategory: [],
        savingsRate: 40,
        monthlyChange: 10,
      },
      isLoading: false,
      isError: false,
      error: null,
      refetch: mockRefetch,
    });

    render(<DashboardPage />);
    
    // Find and click refresh button
    const refreshButton = screen.getByRole('button', { name: /refresh/i });
    fireEvent.click(refreshButton);
    
    // Should call refetch
    expect(mockRefetch).toHaveBeenCalled();
  });
}); 