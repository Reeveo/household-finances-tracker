import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import DashboardPage from '@/pages/dashboard-page';
import React from 'react';

// Create a simplified rendering function that doesn't rely on providers
const renderWithoutProviders = (ui: React.ReactElement) => {
  return render(ui);
};

// Mock the hooks
vi.mock('@/hooks/use-auth', () => ({
  useAuth: () => ({
    user: {
      id: 1,
      name: 'Test User',
      email: 'test@example.com',
      username: 'testuser',
      createdAt: new Date().toISOString(),
    },
    isLoading: false,
  }),
}));

// Mock the query hooks
vi.mock('@tanstack/react-query', () => {
  const mockMutate = vi.fn();
  const mockRefetch = vi.fn();
  return {
    useQuery: () => ({
      data: {},
      isLoading: false,
      isError: false,
      refetch: mockRefetch,
    }),
    useMutation: () => ({
      mutate: mockMutate,
      isLoading: false,
      isError: false,
      isSuccess: false,
    }),
    useQueryClient: () => ({
      setQueryData: vi.fn(),
      invalidateQueries: vi.fn(),
    }),
    QueryClient: vi.fn(),
    QueryClientProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  };
});

// Mock the sidebar component
vi.mock('@/components/layout/sidebar', () => ({
  Sidebar: () => <div data-testid="sidebar" />,
}));

// Mock dashboard components
vi.mock('@/components/dashboard/accounts-overview', () => ({
  AccountsOverview: () => <div data-testid="accounts-overview">Accounts Overview</div>,
}));

vi.mock('@/components/dashboard/summary-cards', () => ({
  SummaryCards: () => <div data-testid="summary-cards">Summary Cards</div>,
}));

vi.mock('@/components/dashboard/monthly-spending-chart', () => ({
  MonthlySpendingChart: () => <div data-testid="monthly-spending">Monthly Spending</div>,
}));

vi.mock('@/components/dashboard/savings-chart', () => ({
  SavingsChart: () => <div data-testid="savings-chart">Savings Chart</div>,
}));

vi.mock('@/components/dashboard/net-worth-chart', () => ({
  NetWorthChart: () => <div data-testid="net-worth-chart">Net Worth Chart</div>,
}));

vi.mock('@/components/dashboard/recent-transactions', () => ({
  RecentTransactions: () => <div data-testid="recent-transactions">Recent Transactions</div>,
}));

// Mock mobile hook
vi.mock('@/hooks/use-mobile', () => ({
  useIsMobile: () => false,
}));

// Mock summary cards
vi.mock('@/components/dashboard/summary-card', () => ({
  SummaryCard: ({ title, value }: { title: string, value: string }) => (
    <div data-testid="summary-card">{title}: {value}</div>
  ),
}));

// Mock recharts components
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  LineChart: () => <div>Line Chart</div>,
  Line: () => null,
  BarChart: () => <div>Bar Chart</div>,
  Bar: () => null,
  XAxis: () => null,
  YAxis: () => null,
  CartesianGrid: () => null,
  Tooltip: () => null,
  Legend: () => null,
  PieChart: () => <div>Pie Chart</div>,
  Pie: () => null,
  Cell: () => null,
  ReferenceLine: () => null,
  ReferenceArea: () => null,
}));

// Basic test to verify rendering
describe('DashboardPage', () => {
  it('renders the dashboard page with all components', () => {
    renderWithoutProviders(<DashboardPage />);
    
    // Check for sidebar
    expect(screen.getByTestId('sidebar')).toBeInTheDocument();
    
    // Check for page title
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    
    // Check for dashboard components
    expect(screen.getByTestId('summary-cards')).toBeInTheDocument();
    expect(screen.getByTestId('monthly-spending')).toBeInTheDocument();
    expect(screen.getByTestId('savings-chart')).toBeInTheDocument();
    expect(screen.getByTestId('net-worth-chart')).toBeInTheDocument();
    expect(screen.getByTestId('recent-transactions')).toBeInTheDocument();
  });
}); 