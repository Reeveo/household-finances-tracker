import { describe, it, expect } from 'vitest';
import {
  categorizeTransaction,
  extractPaymentMethod,
  getDefaultCategoryForKeyword
} from '@/lib/utils/categorization';

describe('Transaction Categorization Utilities', () => {
  describe('categorizeTransaction', () => {
    it('categorizes income transactions correctly', () => {
      // Salary-related transactions
      expect(categorizeTransaction('ACME Corp Salary', 1500)).toEqual({
        category: 'Income',
        subcategory: 'Salary',
        type: 'income'
      });
      
      expect(categorizeTransaction('Monthly Payroll', 2500.50)).toEqual({
        category: 'Income',
        subcategory: 'Salary',
        type: 'income'
      });
      
      expect(categorizeTransaction('Wage Payment', 1800)).toEqual({
        category: 'Income',
        subcategory: 'Salary',
        type: 'income'
      });
      
      // Investment-related income
      expect(categorizeTransaction('Dividend Payment', 300)).toEqual({
        category: 'Income',
        subcategory: 'Investments',
        type: 'income'
      });
      
      expect(categorizeTransaction('Stock Yield HSBC', 120.75)).toEqual({
        category: 'Income',
        subcategory: 'Investments',
        type: 'income'
      });
      
      // Freelance income
      expect(categorizeTransaction('Upwork Payment', 450)).toEqual({
        category: 'Income',
        subcategory: 'Freelance',
        type: 'income'
      });
      
      expect(categorizeTransaction('Fiverr Transfer', 200)).toEqual({
        category: 'Income',
        subcategory: 'Freelance',
        type: 'income'
      });
    });
    
    it('categorizes expense transactions correctly', () => {
      // Groceries
      expect(categorizeTransaction('TESCO SUPERSTORE', -65.40)).toEqual({
        category: 'Essentials',
        subcategory: 'Groceries',
        type: 'expense'
      });
      
      expect(categorizeTransaction('SAINSBURYS', -45.20)).toEqual({
        category: 'Essentials',
        subcategory: 'Groceries',
        type: 'expense'
      });
      
      // Restaurants/Dining
      expect(categorizeTransaction('MCDONALDS', -12.99)).toEqual({
        category: 'Lifestyle',
        subcategory: 'Dining Out',
        type: 'expense'
      });
      
      expect(categorizeTransaction('PIZZA EXPRESS', -34.50)).toEqual({
        category: 'Lifestyle',
        subcategory: 'Dining Out',
        type: 'expense'
      });
      
      // Utilities
      expect(categorizeTransaction('BRITISH GAS', -85.00)).toEqual({
        category: 'Essentials',
        subcategory: 'Utilities',
        type: 'expense'
      });
      
      expect(categorizeTransaction('WATER BILL', -45.50)).toEqual({
        category: 'Essentials',
        subcategory: 'Utilities',
        type: 'expense'
      });
      
      // Entertainment
      expect(categorizeTransaction('NETFLIX SUBSCRIPTION', -13.99)).toEqual({
        category: 'Lifestyle',
        subcategory: 'Entertainment',
        type: 'expense'
      });
      
      expect(categorizeTransaction('SPOTIFY PREMIUM', -9.99)).toEqual({
        category: 'Lifestyle',
        subcategory: 'Entertainment',
        type: 'expense'
      });
      
      // Shopping
      expect(categorizeTransaction('AMAZON RETAIL', -32.50)).toEqual({
        category: 'Lifestyle',
        subcategory: 'Shopping',
        type: 'expense'
      });
      
      expect(categorizeTransaction('ASOS.COM', -67.89)).toEqual({
        category: 'Lifestyle',
        subcategory: 'Clothing',
        type: 'expense'
      });
      
      // Transport
      expect(categorizeTransaction('UBER TRIP', -15.50)).toEqual({
        category: 'Essentials',
        subcategory: 'Transport',
        type: 'expense'
      });
      
      expect(categorizeTransaction('TFL TRAVEL', -23.70)).toEqual({
        category: 'Essentials',
        subcategory: 'Transport',
        type: 'expense'
      });
      
      // Housing
      expect(categorizeTransaction('RENT PAYMENT', -1200.00)).toEqual({
        category: 'Essentials',
        subcategory: 'Housing',
        type: 'expense'
      });
      
      expect(categorizeTransaction('MORTGAGE PAYMENT', -875.50)).toEqual({
        category: 'Essentials',
        subcategory: 'Housing',
        type: 'expense'
      });
    });
    
    it('uses amount to determine transaction type when description is ambiguous', () => {
      // Positive amount should be categorized as income even with ambiguous description
      expect(categorizeTransaction('BANK TRANSFER', 500)).toEqual({
        category: 'Income',
        subcategory: 'Other Income',
        type: 'income'
      });
      
      // Negative amount should be categorized as expense with ambiguous description
      expect(categorizeTransaction('BANK TRANSFER', -500)).toEqual({
        category: 'Other',
        subcategory: 'Uncategorized',
        type: 'expense'
      });
    });
    
    it('handles uncategorized transactions gracefully', () => {
      expect(categorizeTransaction('UNKNOWN MERCHANT XYZ', -50.00)).toEqual({
        category: 'Other',
        subcategory: 'Uncategorized',
        type: 'expense'
      });
      
      expect(categorizeTransaction('MISC PAYMENT', 100.00)).toEqual({
        category: 'Income',
        subcategory: 'Other Income',
        type: 'income'
      });
    });
    
    it('handles case insensitivity correctly', () => {
      // Same categorization regardless of case
      expect(categorizeTransaction('tesco superstore', -65.40)).toEqual(
        categorizeTransaction('TESCO SUPERSTORE', -65.40)
      );
      
      expect(categorizeTransaction('Netflix Subscription', -13.99)).toEqual(
        categorizeTransaction('NETFLIX SUBSCRIPTION', -13.99)
      );
    });
    
    it('handles transactions with special characters', () => {
      expect(categorizeTransaction('AMZN MKTP*UK*AB123', -29.99)).toEqual({
        category: 'Lifestyle',
        subcategory: 'Shopping',
        type: 'expense'
      });
      
      expect(categorizeTransaction('PAYPAL *SPOTIFY', -9.99)).toEqual({
        category: 'Lifestyle',
        subcategory: 'Entertainment',
        type: 'expense'
      });
    });
  });
  
  describe('extractPaymentMethod', () => {
    it('correctly identifies credit card payments', () => {
      expect(extractPaymentMethod('VISA PAYMENT 1234')).toBe('Credit Card');
      expect(extractPaymentMethod('MASTERCARD PURCHASE')).toBe('Credit Card');
      expect(extractPaymentMethod('AMEX PAYMENT')).toBe('Credit Card');
    });
    
    it('correctly identifies debit card payments', () => {
      expect(extractPaymentMethod('DEBIT CARD PURCHASE')).toBe('Debit Card');
      expect(extractPaymentMethod('CARD PAYMENT TESCO')).toBe('Debit Card');
    });
    
    it('correctly identifies bank transfers', () => {
      expect(extractPaymentMethod('BANK TRANSFER TO JOHN')).toBe('Bank Transfer');
      expect(extractPaymentMethod('FASTER PAYMENT TO LANDLORD')).toBe('Bank Transfer');
      expect(extractPaymentMethod('STANDING ORDER PAYMENT')).toBe('Bank Transfer');
      expect(extractPaymentMethod('DIRECT DEBIT PAYMENT')).toBe('Direct Debit');
    });
    
    it('correctly identifies cash transactions', () => {
      expect(extractPaymentMethod('ATM WITHDRAWAL')).toBe('Cash');
      expect(extractPaymentMethod('CASH WITHDRAWAL')).toBe('Cash');
    });
    
    it('correctly identifies digital wallet payments', () => {
      expect(extractPaymentMethod('PAYPAL PAYMENT')).toBe('PayPal');
      expect(extractPaymentMethod('APPLE PAY PURCHASE')).toBe('Apple Pay');
      expect(extractPaymentMethod('GOOGLE PAY PAYMENT')).toBe('Google Pay');
    });
    
    it('returns null for unrecognized payment methods', () => {
      expect(extractPaymentMethod('GENERIC TRANSACTION')).toBeNull();
      expect(extractPaymentMethod('COFFEE SHOP PURCHASE')).toBeNull();
    });
    
    it('handles case insensitivity correctly', () => {
      expect(extractPaymentMethod('paypal payment')).toBe('PayPal');
      expect(extractPaymentMethod('Visa Payment')).toBe('Credit Card');
    });
  });
  
  describe('getDefaultCategoryForKeyword', () => {
    it('returns correct categories for income keywords', () => {
      expect(getDefaultCategoryForKeyword('SALARY')).toEqual(['Income', 'Salary', 'income']);
      expect(getDefaultCategoryForKeyword('DIVIDEND')).toEqual(['Income', 'Investments', 'income']);
      expect(getDefaultCategoryForKeyword('INTEREST')).toEqual(['Income', 'Investments', 'income']);
      expect(getDefaultCategoryForKeyword('FREELANCE')).toEqual(['Income', 'Freelance', 'income']);
    });
    
    it('returns correct categories for expense keywords', () => {
      // Groceries
      expect(getDefaultCategoryForKeyword('TESCO')).toEqual(['Essentials', 'Groceries', 'expense']);
      expect(getDefaultCategoryForKeyword('SAINSBURYS')).toEqual(['Essentials', 'Groceries', 'expense']);
      
      // Dining
      expect(getDefaultCategoryForKeyword('RESTAURANT')).toEqual(['Lifestyle', 'Dining Out', 'expense']);
      expect(getDefaultCategoryForKeyword('MCDONALDS')).toEqual(['Lifestyle', 'Dining Out', 'expense']);
      
      // Utilities
      expect(getDefaultCategoryForKeyword('ELECTRICITY')).toEqual(['Essentials', 'Utilities', 'expense']);
      expect(getDefaultCategoryForKeyword('WATER')).toEqual(['Essentials', 'Utilities', 'expense']);
      
      // Entertainment
      expect(getDefaultCategoryForKeyword('NETFLIX')).toEqual(['Lifestyle', 'Entertainment', 'expense']);
      expect(getDefaultCategoryForKeyword('CINEMA')).toEqual(['Lifestyle', 'Entertainment', 'expense']);
      
      // Housing
      expect(getDefaultCategoryForKeyword('RENT')).toEqual(['Essentials', 'Housing', 'expense']);
      expect(getDefaultCategoryForKeyword('MORTGAGE')).toEqual(['Essentials', 'Housing', 'expense']);
    });
    
    it('returns null for unrecognized keywords', () => {
      expect(getDefaultCategoryForKeyword('UNRECOGNIZED')).toBeNull();
      expect(getDefaultCategoryForKeyword('RANDOM')).toBeNull();
    });
    
    it('handles partial matches correctly', () => {
      // Should match keywords that are part of longer strings
      expect(getDefaultCategoryForKeyword('MY NETFLIX SUBSCRIPTION')).toEqual(['Lifestyle', 'Entertainment', 'expense']);
      expect(getDefaultCategoryForKeyword('SALARY PAYMENT FROM ACME')).toEqual(['Income', 'Salary', 'income']);
    });
    
    it('handles case insensitivity correctly', () => {
      expect(getDefaultCategoryForKeyword('netflix')).toEqual(['Lifestyle', 'Entertainment', 'expense']);
      expect(getDefaultCategoryForKeyword('Salary')).toEqual(['Income', 'Salary', 'income']);
    });
    
    it('prioritizes more specific matches when multiple keywords match', () => {
      // This description contains both "SALARY" and "PAYMENT" keywords
      // Should prioritize "SALARY" as it's more specific
      expect(getDefaultCategoryForKeyword('SALARY PAYMENT')).toEqual(['Income', 'Salary', 'income']);
      
      // This description contains both "AMAZON" and "SUBSCRIPTION" keywords
      // Should prioritize "AMAZON" as it's more specific
      expect(getDefaultCategoryForKeyword('AMAZON SUBSCRIPTION')).toEqual(['Lifestyle', 'Shopping', 'expense']);
    });
  });
}); 