import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import PensionCalculatorPage from '../pages/pension-calculator-page';

// Mock the components used in the pension calculator page
vi.mock('@/components/layout/sidebar', () => ({
  Sidebar: () => <div data-testid="sidebar">Sidebar</div>,
}));

vi.mock('@/components/calculators/pension-calculator', () => ({
  PensionCalculator: ({ onCalculate }: { onCalculate: (data: any) => void }) => {
    const handleSubmit = () => {
      onCalculate({
        currentAge: 35,
        retirementAge: 67,
        currentSalary: 50000,
        salaryGrowthRate: 2.5,
        currentPensionPot: 75000,
        employeeContribution: 5,
        employerContribution: 3,
        investmentReturnRate: 5,
        inflationRate: 2,
        estimatedAnnualIncome: 25000,
        targetRetirementIncome: 35000,
        estimatedPensionPot: 750000,
        incomeGap: 10000,
        projectedLifeExpectancy: 85
      });
    };
    
    return (
      <div data-testid="pension-calculator">
        <button data-testid="calculate-button" onClick={handleSubmit}>Calculate</button>
      </div>
    );
  },
}));

vi.mock('@/components/calculators/pension-results', () => ({
  PensionResults: ({ pensionData }: { pensionData: any }) => (
    <div data-testid="pension-results">
      <span>Estimated Pension Pot: £{pensionData.estimatedPensionPot.toLocaleString()}</span>
      <span>Annual Income: £{pensionData.estimatedAnnualIncome.toLocaleString()}</span>
    </div>
  ),
}));

vi.mock('@/components/calculators/retirement-analysis', () => {
  const RetirementAnalysis = ({ pensionData, onRecalculate }: { pensionData: any, onRecalculate: (updates: any) => void }) => {
    const handleIncreaseContribution = () => {
      onRecalculate({
        employeeContribution: pensionData.employeeContribution + 1,
        estimatedPensionPot: 820000,
        estimatedAnnualIncome: 27500,
        incomeGap: 7500
      });
    };
    
    return (
      <div data-testid="retirement-analysis">
        <span>Income Gap: £{pensionData.incomeGap.toLocaleString()}</span>
        <button data-testid="increase-contribution" onClick={handleIncreaseContribution}>
          Increase Contribution
        </button>
      </div>
    );
  };
  
  return { RetirementAnalysis };
});

describe('PensionCalculatorPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the pension calculator page with all components', () => {
    render(<PensionCalculatorPage />);
    
    // Check for page title
    expect(screen.getByText('Pension Calculator')).toBeInTheDocument();
    
    // Check for calculator component
    expect(screen.getByTestId('pension-calculator')).toBeInTheDocument();
    
    // Check for sidebar
    expect(screen.getByTestId('sidebar')).toBeInTheDocument();
    
    // Initially, results should not be visible
    expect(screen.queryByTestId('pension-results')).not.toBeInTheDocument();
    expect(screen.queryByTestId('retirement-analysis')).not.toBeInTheDocument();
  });

  it('displays pension results when calculation is performed', async () => {
    render(<PensionCalculatorPage />);
    
    // Find and click the calculate button
    const calculateButton = screen.getByTestId('calculate-button');
    fireEvent.click(calculateButton);
    
    // Now the results should be visible
    await waitFor(() => {
      expect(screen.getByTestId('pension-results')).toBeInTheDocument();
      expect(screen.getByTestId('retirement-analysis')).toBeInTheDocument();
    });
    
    // Check for specific pension data
    expect(screen.getByText('Estimated Pension Pot: £750,000')).toBeInTheDocument();
    expect(screen.getByText('Annual Income: £25,000')).toBeInTheDocument();
    expect(screen.getByText('Income Gap: £10,000')).toBeInTheDocument();
  });

  it('updates pension results when recalculation is triggered', async () => {
    render(<PensionCalculatorPage />);
    
    // Initial calculation
    const calculateButton = screen.getByTestId('calculate-button');
    fireEvent.click(calculateButton);
    
    // Verify initial results
    await waitFor(() => {
      expect(screen.getByText('Estimated Pension Pot: £750,000')).toBeInTheDocument();
      expect(screen.getByText('Annual Income: £25,000')).toBeInTheDocument();
    });
    
    // Click the increase contribution button in the retirement analysis
    const increaseButton = screen.getByTestId('increase-contribution');
    fireEvent.click(increaseButton);
    
    // Check for updated results
    await waitFor(() => {
      expect(screen.getByText('Estimated Pension Pot: £820,000')).toBeInTheDocument();
      expect(screen.getByText('Annual Income: £27,500')).toBeInTheDocument();
      expect(screen.getByText('Income Gap: £7,500')).toBeInTheDocument();
    });
  });

  it('handles multiple recalculations correctly', async () => {
    render(<PensionCalculatorPage />);
    
    // Initial calculation
    const calculateButton = screen.getByTestId('calculate-button');
    fireEvent.click(calculateButton);
    
    // First recalculation
    const increaseButton = screen.getByTestId('increase-contribution');
    fireEvent.click(increaseButton);
    
    // Check intermediate results
    await waitFor(() => {
      expect(screen.getByText('Income Gap: £7,500')).toBeInTheDocument();
    });
    
    // Second recalculation
    fireEvent.click(increaseButton);
    
    // The mocked RetirementAnalysis doesn't actually update the pensionData.employeeContribution
    // in its internal state between clicks, so we would see the same change again
    await waitFor(() => {
      expect(screen.getByText('Income Gap: £7,500')).toBeInTheDocument();
    });
  });
}); 