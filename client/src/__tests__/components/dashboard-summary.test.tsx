import React from 'react';
import { render, screen } from '@testing-library/react';
import { DashboardSummary } from '@/components/dashboard/dashboard-summary';
import { vi } from 'vitest';
import { renderWithProviders } from '../test-utils';

// Mock components that might be used in DashboardSummary
vi.mock('@/components/ui/card', () => ({
  Card: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="card">{children}</div>
  ),
  CardHeader: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="card-header">{children}</div>
  ),
  CardTitle: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="card-title">{children}</div>
  ),
  CardContent: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="card-content">{children}</div>
  ),
  CardFooter: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="card-footer">{children}</div>
  ),
}));

vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="responsive-container">{children}</div>
  ),
  PieChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="pie-chart">{children}</div>
  ),
  Pie: () => <div data-testid="pie" />,
  Cell: () => <div data-testid="cell" />,
  Tooltip: () => <div data-testid="tooltip" />,
  Legend: () => <div data-testid="legend" />,
}));

describe('DashboardSummary', () => {
  const mockData = {
    totalIncome: 5000,
    totalExpenses: 3000,
    netSavings: 2000,
    incomeByCategory: [
      { name: 'Salary', value: 4500, color: '#4CAF50' },
      { name: 'Investments', value: 500, color: '#2196F3' },
    ],
    expensesByCategory: [
      { name: 'Housing', value: 1200, color: '#F44336' },
      { name: 'Food', value: 800, color: '#FF9800' },
      { name: 'Utilities', value: 400, color: '#9C27B0' },
      { name: 'Entertainment', value: 300, color: '#3F51B5' },
      { name: 'Transportation', value: 300, color: '#009688' },
    ],
    savingsRate: 40, // 40%
    monthlyChange: 10, // 10% increase from last month
  };

  it('renders the dashboard summary with all sections', () => {
    render(<DashboardSummary data={mockData} loading={false} error={null} />);
    
    // Check if main sections are rendered
    expect(screen.getByText('Monthly Summary')).toBeInTheDocument();
    expect(screen.getByText('Income')).toBeInTheDocument();
    expect(screen.getByText('Expenses')).toBeInTheDocument();
    expect(screen.getByText('Net Savings')).toBeInTheDocument();
    
    // Check if the correct monetary values are displayed
    expect(screen.getByText('£5,000.00')).toBeInTheDocument();
    expect(screen.getByText('£3,000.00')).toBeInTheDocument();
    expect(screen.getByText('£2,000.00')).toBeInTheDocument();
    
    // Check if savings rate is displayed
    expect(screen.getByText('40%')).toBeInTheDocument();
    
    // Check if charts are rendered
    expect(screen.getAllByTestId('pie-chart').length).toBeGreaterThan(0);
  });

  it('renders a loading state when data is loading', () => {
    render(<DashboardSummary data={null} loading={true} error={null} />);
    
    // Check for loading indicators
    expect(screen.getAllByTestId('loading-skeleton').length).toBeGreaterThan(0);
  });

  it('renders an error state when there is an error', () => {
    render(<DashboardSummary data={null} loading={false} error="Failed to load dashboard data" />);
    
    // Check for error message
    expect(screen.getByText('Failed to load dashboard data')).toBeInTheDocument();
    expect(screen.getByText('Try refreshing the page')).toBeInTheDocument();
  });

  it('displays no data available message when data is empty', () => {
    const emptyData = {
      totalIncome: 0,
      totalExpenses: 0,
      netSavings: 0,
      incomeByCategory: [],
      expensesByCategory: [],
      savingsRate: 0,
      monthlyChange: 0,
    };
    
    render(<DashboardSummary data={emptyData} loading={false} error={null} />);
    
    // Check for no data messages
    expect(screen.getAllByText('No data available').length).toBeGreaterThan(0);
  });

  it('displays month-over-month change indicator', () => {
    render(<DashboardSummary data={mockData} loading={false} error={null} />);
    
    // Check for the monthly change percentage
    expect(screen.getByText('+10%')).toBeInTheDocument();
    
    // With positive change, should show an up arrow
    expect(screen.getByTestId('trend-up-icon')).toBeInTheDocument();
    
    // For negative change, should show a down arrow
    const negativeChangeData = {
      ...mockData,
      monthlyChange: -5, // 5% decrease from last month
    };
    
    render(<DashboardSummary data={negativeChangeData} loading={false} error={null} />);
    expect(screen.getByText('-5%')).toBeInTheDocument();
    expect(screen.getByTestId('trend-down-icon')).toBeInTheDocument();
  });

  it('handles click on category sections', () => {
    const onCategoryClick = vi.fn();
    
    render(
      <DashboardSummary 
        data={mockData} 
        loading={false} 
        error={null} 
        onCategoryClick={onCategoryClick} 
      />
    );
    
    // Find and click on a category item
    const categoryItem = screen.getByText('Housing');
    categoryItem.click();
    
    // Check if the click handler was called with the correct category
    expect(onCategoryClick).toHaveBeenCalledWith('Housing', 'expense');
    
    // Click on an income category
    const incomeCategoryItem = screen.getByText('Salary');
    incomeCategoryItem.click();
    
    // Check if the click handler was called with the correct category
    expect(onCategoryClick).toHaveBeenCalledWith('Salary', 'income');
  });

  it('handles currency formatting correctly', () => {
    const dataWithDecimalValues = {
      ...mockData,
      totalIncome: 5000.75,
      totalExpenses: 3000.5,
      netSavings: 2000.25,
    };
    
    render(<DashboardSummary data={dataWithDecimalValues} loading={false} error={null} />);
    
    // Check if the decimal values are formatted correctly
    expect(screen.getByText('£5,000.75')).toBeInTheDocument();
    expect(screen.getByText('£3,000.50')).toBeInTheDocument();
    expect(screen.getByText('£2,000.25')).toBeInTheDocument();
  });
  
  it('displays appropriate colors for positive and negative values', () => {
    const dataWithNegativeSavings = {
      ...mockData,
      netSavings: -500,
      savingsRate: -10,
      monthlyChange: -20,
    };
    
    render(<DashboardSummary data={dataWithNegativeSavings} loading={false} error={null} />);
    
    // Check if negative values have the appropriate color class
    const netSavingsElement = screen.getByText('£-500.00');
    expect(netSavingsElement).toHaveClass('text-destructive');
    
    // Check if negative rate has the appropriate color class
    const savingsRateElement = screen.getByText('-10%');
    expect(savingsRateElement).toHaveClass('text-destructive');
  });
}); 