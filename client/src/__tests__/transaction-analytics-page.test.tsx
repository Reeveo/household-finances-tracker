import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import TransactionAnalyticsPage from '@/pages/transaction-analytics-page';
import React from 'react';

// Create a simplified rendering function that doesn't rely on providers
const renderWithoutProviders = (ui: React.ReactElement) => {
  return render(ui);
};

// Mock the mobile hook
vi.mock('@/hooks/use-mobile', () => ({
  useIsMobile: () => false,
}));

// Mock the sidebar component
vi.mock('@/components/layout/sidebar', () => ({
  Sidebar: () => <div data-testid="sidebar" />,
}));

// Mock the transaction analytics component
vi.mock('@/components/analytics/transaction-analytics', () => ({
  TransactionAnalytics: () => <div data-testid="transaction-analytics">Transaction Analytics Component</div>,
}));

// Mock wouter Link component
vi.mock('wouter', () => ({
  Link: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href} data-testid="wouter-link">
      {children}
    </a>
  ),
}));

// Basic test to verify rendering
describe('TransactionAnalyticsPage', () => {
  it('renders the transaction analytics page with all components', () => {
    renderWithoutProviders(<TransactionAnalyticsPage />);
    
    // Check for sidebar
    expect(screen.getByTestId('sidebar')).toBeInTheDocument();
    
    // Check for page title
    expect(screen.getByText('Transaction Analytics')).toBeInTheDocument();
    
    // Check for back button link
    expect(screen.getByTestId('wouter-link')).toHaveAttribute('href', '/income-expenses');
    
    // Check for transaction analytics component
    expect(screen.getByTestId('transaction-analytics')).toBeInTheDocument();
    
    // Check for help button
    expect(screen.getByText('Help')).toBeInTheDocument();
  });
}); 