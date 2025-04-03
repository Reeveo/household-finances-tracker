// client/src/components/dashboard/__tests__/summary-card.test.tsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Router } from 'wouter'; // Import the actual Router
// Adjust the import path based on the actual file structure if needed
// Assuming SummaryCard is exported directly from the file, not as default
import { SummaryCard } from '../summary-cards'; 
import { TooltipProvider } from '@/components/ui/tooltip'; // Needed for Tooltip

// Mock data for a basic card
const baseProps = {
  title: "Test Card",
  amount: "£100.00",
  change: { value: "+1.5%", isPositive: true },
};

// Helper function to render with providers
const renderWithProviders = (ui: React.ReactElement) => {
  return render(
    <TooltipProvider> {/* Required by Tooltip within SummaryCard */}
      <Router> {/* Required by Link within SummaryCard */}
        {ui}
      </Router>
    </TooltipProvider>
  );
};

describe('SummaryCard', () => {
  it('renders basic card information correctly', () => {
    renderWithProviders(<SummaryCard {...baseProps} />);
    expect(screen.getByText('Test Card')).toBeInTheDocument();
    expect(screen.getByText('£100.00')).toBeInTheDocument();
    expect(screen.getByText('+1.5%')).toBeInTheDocument();
    // Check for positive change indicator (TrendingUp icon)
    // Ensure you add data-testid="trending-up-icon" to the icon in SummaryCard
    // expect(screen.getByTestId('trending-up-icon')).toBeInTheDocument(); 
  });

  it('renders negative change correctly', () => {
    renderWithProviders(
      <SummaryCard {...baseProps} change={{ value: "-2.0%", isPositive: false }} />
    );
    expect(screen.getByText('-2.0%')).toBeInTheDocument();
     // Check for negative change indicator (TrendingDown icon)
     // Ensure you add data-testid="trending-down-icon" to the icon in SummaryCard
    // expect(screen.getByTestId('trending-down-icon')).toBeInTheDocument(); 
  });

  it('renders tooltip when provided', () => {
    renderWithProviders(<SummaryCard {...baseProps} tooltip="Test tooltip content" />);
    // Tooltip content might not be immediately visible, test for trigger presence
    // Ensure you add data-testid="tooltip-trigger-icon" to the Info icon
    // expect(screen.getByTestId('tooltip-trigger-icon')).toBeInTheDocument(); 
  });

  it('renders progress bar when provided', () => {
    renderWithProviders(
      <SummaryCard 
        {...baseProps} 
        progress={{ value: 75, max: 100, percentage: 75, label: "Test Progress" }} 
      />
    );
    expect(screen.getByText('Test Progress')).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '75');
    expect(screen.getByText('75%')).toBeInTheDocument();
  });

  it('renders warning alert when provided', () => {
    renderWithProviders(
      <SummaryCard 
        {...baseProps} 
        alert={{ message: "Test warning", type: "warning" }} 
      />
    );
    expect(screen.getByText('Test warning')).toBeInTheDocument();
    // Check for warning icon
    // Ensure you add data-testid="alert-circle-icon" to the AlertCircle icon
    // expect(screen.getByTestId('alert-circle-icon')).toBeInTheDocument(); 
  });

  it('renders info alert when provided', () => {
    renderWithProviders(
      <SummaryCard 
        {...baseProps} 
        alert={{ message: "Test info", type: "info" }} 
      />
    );
    expect(screen.getByText('Test info')).toBeInTheDocument();
     // Check for info icon
     // Ensure you add data-testid="info-alert-icon" to the Info icon used in alerts
    // expect(screen.getByTestId('info-alert-icon')).toBeInTheDocument(); 
  });

  it('renders action link correctly when provided', () => {
    renderWithProviders(
      <SummaryCard 
        {...baseProps} 
        actionLink="/test-action" 
        actionText="Perform Action" 
      />
    );
    const linkElement = screen.getByRole('link', { name: /Perform Action/i });
    expect(linkElement).toBeInTheDocument();
    expect(linkElement).toHaveAttribute('href', '/test-action');
    // Check for arrow icon within the link/button
    // Ensure you add data-testid="arrow-right-icon" to ArrowRight icon
    // expect(linkElement.querySelector('[data-testid="arrow-right-icon"]')).toBeInTheDocument(); 
  });

  it('does not render action link when props are missing', () => {
    renderWithProviders(<SummaryCard {...baseProps} />);
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });
});