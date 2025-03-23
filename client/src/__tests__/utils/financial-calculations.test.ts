import { describe, it, expect } from 'vitest';
import {
  calculateMortgagePayment,
  calculateTotalInterest,
  calculateOverpaymentImpact,
  calculatePensionProjection,
  calculateAnnualRetirementIncome,
  calculateCompoundInterest,
  formatCurrency,
  calculateBudgetProgress
} from '@/lib/utils/financial-calculations';

describe('Financial Calculations', () => {
  describe('calculateMortgagePayment', () => {
    it('calculates the correct monthly payment for a mortgage', () => {
      // £200,000 loan at 3.5% for 25 years
      const payment = calculateMortgagePayment(200000, 3.5, 25);
      
      // Expected monthly payment: approximately £1,006.05
      expect(payment).toBeCloseTo(1006.05, 1);
    });

    it('handles zero interest rate', () => {
      // £200,000 loan at 0% for 25 years
      const payment = calculateMortgagePayment(200000, 0, 25);
      
      // Expected monthly payment: £666.67 (just principal divided by total months)
      expect(payment).toBeCloseTo(666.67, 1);
    });

    it('handles very short loan term', () => {
      // £50,000 loan at 3.5% for 1 year
      const payment = calculateMortgagePayment(50000, 3.5, 1);
      
      // Expected monthly payment: approximately £4,232.62
      expect(payment).toBeCloseTo(4232.62, 1);
    });
  });

  describe('calculateTotalInterest', () => {
    it('calculates the correct total interest paid', () => {
      // £200,000 loan with £1,006 monthly payment for 25 years
      const totalInterest = calculateTotalInterest(200000, 1006, 25);
      
      // Expected total interest: approximately £101,800 (total paid minus principal)
      expect(totalInterest).toBeCloseTo(101800, -2);
    });
  });

  describe('calculateOverpaymentImpact', () => {
    it('calculates the impact of monthly overpayments', () => {
      // £200,000 outstanding, 3.5% interest, 20 years remaining, £100 monthly overpayment
      const impact = calculateOverpaymentImpact(200000, 3.5, 20, 100, 0);
      
      // Expected time reduction: months saved (approximately 22-26 months)
      expect(impact.monthsSaved).toBeGreaterThanOrEqual(22);
      expect(impact.monthsSaved).toBeLessThanOrEqual(26);
      
      // Expected interest saved: approximately £7,000-£9,000
      expect(impact.interestSaved).toBeGreaterThanOrEqual(7000);
      expect(impact.interestSaved).toBeLessThanOrEqual(9000);
    });

    it('calculates the impact of annual lump sum payments', () => {
      // £200,000 outstanding, 3.5% interest, 20 years remaining, £1,000 annual lump sum
      const impact = calculateOverpaymentImpact(200000, 3.5, 20, 0, 1000);
      
      // There should be some impact on the loan term and interest paid
      expect(impact.monthsSaved).toBeGreaterThan(0);
      expect(impact.interestSaved).toBeGreaterThan(0);
    });
  });

  describe('calculatePensionProjection', () => {
    it('projects pension growth correctly', () => {
      // £50,000 current value, £500 monthly contribution, 5% annual return, 20 years
      const projection = calculatePensionProjection(50000, 500, 5, 20);
      
      // Expected future value: approximately £269,000-£273,000
      expect(projection).toBeGreaterThanOrEqual(269000);
      expect(projection).toBeLessThanOrEqual(273000);
    });
  });

  describe('calculateAnnualRetirementIncome', () => {
    it('calculates retirement income based on withdrawal rate', () => {
      // £500,000 pension pot, 4% withdrawal rate
      const income = calculateAnnualRetirementIncome(500000, 4);
      
      // Expected annual income: £20,000
      expect(income).toBe(20000);
    });

    it('uses default withdrawal rate when not specified', () => {
      // £500,000 pension pot, default 4% withdrawal rate
      const income = calculateAnnualRetirementIncome(500000);
      
      // Expected annual income: £20,000
      expect(income).toBe(20000);
    });
  });

  describe('calculateCompoundInterest', () => {
    it('calculates compound interest growth correctly', () => {
      // £10,000 principal, £200 monthly contribution, 5% annual return, 10 years
      const futureValue = calculateCompoundInterest(10000, 200, 5, 10);
      
      // Expected future value: approximately £49,000-£51,000
      expect(futureValue).toBeGreaterThanOrEqual(49000);
      expect(futureValue).toBeLessThanOrEqual(51000);
    });
  });

  describe('formatCurrency', () => {
    it('formats currency values correctly', () => {
      expect(formatCurrency(1234.56)).toBe('£1,234.56');
      expect(formatCurrency(1000000)).toBe('£1,000,000.00');
      expect(formatCurrency(0)).toBe('£0.00');
      expect(formatCurrency(-99.99)).toBe('£99.99');
    });

    it('accepts custom currency symbols', () => {
      expect(formatCurrency(1234.56, '$')).toBe('$1,234.56');
      expect(formatCurrency(1234.56, '€')).toBe('€1,234.56');
    });
  });

  describe('calculateBudgetProgress', () => {
    it('calculates budget progress correctly', () => {
      // Current: £800, Target: £1,000
      const result = calculateBudgetProgress(800, 1000);
      
      // Expected percentage: 80%, not overspent
      expect(result.percentage).toBe(80);
      expect(result.isOverBudget).toBe(false);
    });

    it('handles overspent budgets', () => {
      // Current: £1,200, Target: £1,000
      const result = calculateBudgetProgress(1200, 1000);
      
      // Expected percentage: 120%, overspent
      expect(result.percentage).toBe(120);
      expect(result.isOverBudget).toBe(true);
    });

    it('handles zero target', () => {
      // Current: £100, Target: £0
      const result = calculateBudgetProgress(100, 0);
      
      // Should handle division by zero gracefully
      expect(result.percentage).toBe(100);
      expect(result.isOverBudget).toBe(true);
    });
  });
});