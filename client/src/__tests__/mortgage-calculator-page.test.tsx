import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import MortgageCalculatorPage from '../pages/mortgage-calculator-page';

// Mock the components used in the mortgage calculator page
vi.mock('@/components/layout/sidebar', () => ({
  Sidebar: () => <div data-testid="sidebar">Sidebar</div>,
}));

vi.mock('@/components/calculators/mortgage-calculator', () => ({
  MortgageCalculator: ({ onCalculate }: { onCalculate: (data: any) => void }) => {
    const handleSubmit = () => {
      onCalculate({
        propertyValue: 300000,
        downPayment: 60000,
        interestRate: 3.5,
        loanTerm: 30,
        startDate: new Date(),
        monthlyPayment: 1077.71,
        totalInterest: 148000,
        totalCost: 388000,
        loanAmount: 240000,
        payoffDate: new Date(new Date().setFullYear(new Date().getFullYear() + 30))
      });
    };
    
    return (
      <div data-testid="mortgage-calculator">
        <button data-testid="calculate-button" onClick={handleSubmit}>Calculate</button>
      </div>
    );
  },
}));

vi.mock('@/components/calculators/mortgage-summary', () => ({
  MortgageSummary: ({ mortgageData }: { mortgageData: any }) => (
    <div data-testid="mortgage-summary">
      <span>Monthly Payment: £{mortgageData.monthlyPayment}</span>
      <span>Total Interest: £{mortgageData.totalInterest}</span>
    </div>
  ),
}));

vi.mock('@/components/calculators/amortization-schedule', () => ({
  AmortizationSchedule: ({ mortgageData }: { mortgageData: any }) => (
    <div data-testid="amortization-schedule">
      Amortization Schedule
    </div>
  ),
}));

describe('MortgageCalculatorPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the mortgage calculator page with all components', () => {
    render(<MortgageCalculatorPage />);
    
    // Check for page title
    expect(screen.getByText('Mortgage Calculator')).toBeInTheDocument();
    
    // Check for calculator component
    expect(screen.getByTestId('mortgage-calculator')).toBeInTheDocument();
    
    // Check for sidebar
    expect(screen.getByTestId('sidebar')).toBeInTheDocument();
    
    // Initially, results should not be visible
    expect(screen.queryByTestId('mortgage-summary')).not.toBeInTheDocument();
    expect(screen.queryByTestId('amortization-schedule')).not.toBeInTheDocument();
  });

  it('displays mortgage results when calculation is performed', async () => {
    render(<MortgageCalculatorPage />);
    
    // Find and click the calculate button
    const calculateButton = screen.getByTestId('calculate-button');
    fireEvent.click(calculateButton);
    
    // Now the results should be visible
    await waitFor(() => {
      expect(screen.getByTestId('mortgage-summary')).toBeInTheDocument();
      expect(screen.getByTestId('amortization-schedule')).toBeInTheDocument();
    });
    
    // Check for specific mortgage data
    expect(screen.getByText('Monthly Payment: £1077.71')).toBeInTheDocument();
    expect(screen.getByText('Total Interest: £148000')).toBeInTheDocument();
  });

  it('updates mortgage results when recalculation is performed', async () => {
    const { rerender } = render(<MortgageCalculatorPage />);
    
    // Initial calculation
    const calculateButton = screen.getByTestId('calculate-button');
    fireEvent.click(calculateButton);
    
    // Verify initial results
    await waitFor(() => {
      expect(screen.getByText('Monthly Payment: £1077.71')).toBeInTheDocument();
    });
    
    // Mock a different calculation result
    vi.mocked(vi.fn()).mockClear();
    vi.mock('@/components/calculators/mortgage-calculator', () => ({
      MortgageCalculator: ({ onCalculate }: { onCalculate: (data: any) => void }) => {
        const handleSubmit = () => {
          onCalculate({
            propertyValue: 400000,
            downPayment: 80000,
            interestRate: 4.0,
            loanTerm: 25,
            startDate: new Date(),
            monthlyPayment: 1584.21,
            totalInterest: 155263,
            totalCost: 475263,
            loanAmount: 320000,
            payoffDate: new Date(new Date().setFullYear(new Date().getFullYear() + 25))
          });
        };
        
        return (
          <div data-testid="mortgage-calculator">
            <button data-testid="recalculate-button" onClick={handleSubmit}>Recalculate</button>
          </div>
        );
      },
    }));
    
    // Rerender with the new mock
    rerender(<MortgageCalculatorPage />);
    
    // Perform recalculation
    const recalculateButton = screen.getByTestId('recalculate-button');
    fireEvent.click(recalculateButton);
    
    // Check for updated results
    await waitFor(() => {
      expect(screen.getByText('Monthly Payment: £1584.21')).toBeInTheDocument();
      expect(screen.getByText('Total Interest: £155263')).toBeInTheDocument();
    });
  });
}); 