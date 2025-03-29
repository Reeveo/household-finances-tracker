import React from 'react';
import { render, screen } from '@testing-library/react';
import { vi, describe, it, expect } from 'vitest';
import DashboardPage from '../pages/dashboard-page';
import { renderWithProviders } from './test-utils';

// Mock components
vi.mock('../components/layout/sidebar', () => ({
  Sidebar: () => <div data-testid="sidebar">Sidebar</div>
}));

vi.mock('../components/dashboard/summary-cards', () => ({
  SummaryCards: () => <div data-testid="summary-cards">Summary Cards</div>
}));

vi.mock('../components/dashboard/monthly-spending-chart', () => ({
  MonthlySpendingChart: () => <div data-testid="spending-chart">Monthly Spending Chart</div>
}));

vi.mock('../components/dashboard/savings-chart', () => ({
  SavingsChart: () => <div data-testid="savings-chart">Savings Chart</div>
}));

vi.mock('../components/dashboard/net-worth-chart', () => ({
  NetWorthChart: () => <div data-testid="net-worth-chart">Net Worth Chart</div>
}));

vi.mock('../components/dashboard/recent-transactions', () => ({
  RecentTransactions: () => <div data-testid="recent-transactions">Recent Transactions</div>
}));

vi.mock('lucide-react', () => ({
  RefreshCw: () => <div data-testid="refresh-icon">RefreshIcon</div>
}));

vi.mock('../hooks/use-mobile', () => ({
  useIsMobile: () => false
}));

describe('DashboardPage', () => {
  it('renders the dashboard page with all components', () => {
    renderWithProviders(<DashboardPage />);
    
    // Check for page title
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    
    // Check that all major components are rendered
    expect(screen.getByTestId('sidebar')).toBeInTheDocument();
    expect(screen.getByTestId('summary-cards')).toBeInTheDocument();
    expect(screen.getByTestId('spending-chart')).toBeInTheDocument();
    expect(screen.getByTestId('savings-chart')).toBeInTheDocument();
    expect(screen.getByTestId('net-worth-chart')).toBeInTheDocument();
    expect(screen.getByTestId('recent-transactions')).toBeInTheDocument();
    
    // Check for refresh button
    const refreshButton = screen.getByRole('button', { name: /refresh/i });
    expect(refreshButton).toBeInTheDocument();
  });
}); 