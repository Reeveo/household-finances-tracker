import { describe, it, expect, beforeEach, vi } from 'vitest';
import { MemStorage } from '../storage';

describe('MemStorage Enhanced Tests', () => {
  let storage: MemStorage;
  
  beforeEach(() => {
    // Create a fresh instance for each test
    storage = new MemStorage();
  });
  
  describe('User methods - Edge Cases', () => {
    it('handles duplicate usernames when creating users', async () => {
      // Create the first user
      await storage.createUser({
        username: 'duplicate',
        password: 'password123',
        name: 'Original User',
        email: 'original@example.com'
      });
      
      // Try to create another user with the same username
      try {
        await storage.createUser({
          username: 'duplicate',
          password: 'different',
          name: 'Second User',
          email: 'second@example.com'
        });
        // If we get here, the test should fail
        expect(true).toBe(false); // This should not be reached
      } catch (error) {
        // We expect an error to be thrown
        expect(error).toBeDefined();
        expect((error as Error).message).toContain('Username already exists');
      }
    });
    
    it('handles duplicate emails when creating users', async () => {
      // Create the first user
      await storage.createUser({
        username: 'user1',
        password: 'password123',
        name: 'Original User',
        email: 'duplicate@example.com'
      });
      
      // Try to create another user with the same email
      try {
        await storage.createUser({
          username: 'user2',
          password: 'different',
          name: 'Second User',
          email: 'duplicate@example.com'
        });
        // If we get here, the test should fail
        expect(true).toBe(false); // This should not be reached
      } catch (error) {
        // We expect an error to be thrown
        expect(error).toBeDefined();
        expect((error as Error).message).toContain('Email already exists');
      }
    });
    
    it('handles empty or invalid user input', async () => {
      try {
        await storage.createUser({
          username: '',
          password: 'password123',
          name: 'Invalid User',
          email: 'invalid@example.com'
        });
        expect(true).toBe(false); // This should not be reached
      } catch (error) {
        expect(error).toBeDefined();
        expect((error as Error).message).toContain('Username cannot be empty');
      }
      
      try {
        await storage.createUser({
          username: 'validname',
          password: '',
          name: 'Invalid User',
          email: 'invalid@example.com'
        });
        expect(true).toBe(false); // This should not be reached
      } catch (error) {
        expect(error).toBeDefined();
        expect((error as Error).message).toContain('Password cannot be empty');
      }
      
      try {
        await storage.createUser({
          username: 'validname',
          password: 'password123',
          name: 'Invalid User',
          email: 'invalid-email'
        });
        expect(true).toBe(false); // This should not be reached
      } catch (error) {
        expect(error).toBeDefined();
        expect((error as Error).message).toContain('Invalid email format');
      }
    });
  });
  
  describe('Transaction methods - Edge Cases', () => {
    let userId: number;
    
    beforeEach(async () => {
      // Create a test user first
      const user = await storage.createUser({
        username: 'transactionuser',
        password: 'password',
        name: 'Transaction User',
        email: 'transactions@example.com'
      });
      userId = user.id;
    });
    
    it('handles invalid transaction amounts', async () => {
      try {
        await storage.createTransaction({
          userId,
          date: '2023-06-15',
          description: 'Invalid Amount',
          amount: 'not-a-number',
          category: 'Income',
          subcategory: 'Salary',
          type: 'income',
          paymentMethod: 'Bank Transfer',
          isRecurring: false,
          budgetMonth: null,
          balance: null,
          reference: null,
          notes: null,
          importHash: null
        });
        expect(true).toBe(false); // This should not be reached
      } catch (error) {
        expect(error).toBeDefined();
        expect((error as Error).message).toContain('Invalid amount');
      }
    });
    
    it('handles invalid date formats', async () => {
      try {
        await storage.createTransaction({
          userId,
          date: 'invalid-date',
          description: 'Invalid Date',
          amount: '100.00',
          category: 'Income',
          subcategory: 'Salary',
          type: 'income',
          paymentMethod: 'Bank Transfer',
          isRecurring: false,
          budgetMonth: null,
          balance: null,
          reference: null,
          notes: null,
          importHash: null
        });
        expect(true).toBe(false); // This should not be reached
      } catch (error) {
        expect(error).toBeDefined();
        expect((error as Error).message).toContain('Invalid date format');
      }
    });
    
    it('enforces required transaction fields', async () => {
      try {
        await storage.createTransaction({
          userId,
          date: '2023-06-15',
          description: '',  // Empty description
          amount: '100.00',
          category: 'Income',
          subcategory: 'Salary',
          type: 'income',
          paymentMethod: 'Bank Transfer',
          isRecurring: false,
          budgetMonth: null,
          balance: null,
          reference: null,
          notes: null,
          importHash: null
        });
        expect(true).toBe(false); // This should not be reached
      } catch (error) {
        expect(error).toBeDefined();
        expect((error as Error).message).toContain('Description is required');
      }
      
      try {
        await storage.createTransaction({
          userId,
          date: '2023-06-15',
          description: 'Missing Category',
          amount: '100.00',
          category: '',  // Empty category
          subcategory: 'Salary',
          type: 'income',
          paymentMethod: 'Bank Transfer',
          isRecurring: false,
          budgetMonth: null,
          balance: null,
          reference: null,
          notes: null,
          importHash: null
        });
        expect(true).toBe(false); // This should not be reached
      } catch (error) {
        expect(error).toBeDefined();
        expect((error as Error).message).toContain('Category is required');
      }
    });
    
    it('handles non-existent user ID for transactions', async () => {
      try {
        await storage.createTransaction({
          userId: 9999,  // Non-existent user ID
          date: '2023-06-15',
          description: 'Invalid User',
          amount: '100.00',
          category: 'Income',
          subcategory: 'Salary',
          type: 'income',
          paymentMethod: 'Bank Transfer',
          isRecurring: false,
          budgetMonth: null,
          balance: null,
          reference: null,
          notes: null,
          importHash: null
        });
        expect(true).toBe(false); // This should not be reached
      } catch (error) {
        expect(error).toBeDefined();
        expect((error as Error).message).toContain('User not found');
      }
    });
    
    it('handles updating non-existent transactions', async () => {
      const result = await storage.updateTransaction(9999, {
        description: 'Updated Description',
        amount: '150.00'
      });
      
      expect(result).toBeUndefined();
    });
    
    it('handles deleting non-existent transactions', async () => {
      const result = await storage.deleteTransaction(9999);
      
      expect(result).toBe(false);
    });
    
    it('validates transaction type values', async () => {
      try {
        await storage.createTransaction({
          userId,
          date: '2023-06-15',
          description: 'Invalid Type',
          amount: '100.00',
          category: 'Income',
          subcategory: 'Salary',
          type: 'invalid-type', // Not 'income' or 'expense'
          paymentMethod: 'Bank Transfer',
          isRecurring: false,
          budgetMonth: null,
          balance: null,
          reference: null,
          notes: null,
          importHash: null
        });
        expect(true).toBe(false); // This should not be reached
      } catch (error) {
        expect(error).toBeDefined();
        expect((error as Error).message).toContain('Invalid transaction type');
      }
    });
    
    it('handles recurring transactions with invalid frequency', async () => {
      try {
        await storage.createTransaction({
          userId,
          date: '2023-06-15',
          description: 'Invalid Frequency',
          amount: '100.00',
          category: 'Income',
          subcategory: 'Salary',
          type: 'income',
          paymentMethod: 'Bank Transfer',
          isRecurring: true,
          frequency: 'invalid-frequency', // Not valid
          hasEndDate: false,
          endDate: null,
          nextDueDate: '2023-07-15',
          budgetMonth: null,
          balance: null,
          reference: null,
          notes: null,
          importHash: null
        });
        expect(true).toBe(false); // This should not be reached
      } catch (error) {
        expect(error).toBeDefined();
        expect((error as Error).message).toContain('Invalid frequency');
      }
    });
    
    it('handles recurring transactions with invalid next due date', async () => {
      try {
        await storage.createTransaction({
          userId,
          date: '2023-06-15',
          description: 'Invalid Next Due Date',
          amount: '100.00',
          category: 'Income',
          subcategory: 'Salary',
          type: 'income',
          paymentMethod: 'Bank Transfer',
          isRecurring: true,
          frequency: 'monthly',
          hasEndDate: false,
          endDate: null,
          nextDueDate: 'invalid-date', // Invalid date
          budgetMonth: null,
          balance: null,
          reference: null,
          notes: null,
          importHash: null
        });
        expect(true).toBe(false); // This should not be reached
      } catch (error) {
        expect(error).toBeDefined();
        expect((error as Error).message).toContain('Invalid next due date');
      }
    });
  });
  
  describe('Budget Month Filtering', () => {
    let userId: number;
    
    beforeEach(async () => {
      // Create a test user first
      const user = await storage.createUser({
        username: 'budgetuser',
        password: 'password',
        name: 'Budget User',
        email: 'budget@example.com'
      });
      userId = user.id;
      
      // Create transactions for different budget months
      await storage.createManyTransactions([
        {
          userId,
          date: '2023-01-15',
          description: 'January Transaction',
          amount: '100.00',
          category: 'Income',
          type: 'income',
          paymentMethod: null,
          isRecurring: null,
          subcategory: null,
          budgetMonth: 1,
          budgetYear: 2023,
          balance: null,
          reference: null,
          notes: null,
          importHash: null
        },
        {
          userId,
          date: '2023-02-15',
          description: 'February Transaction',
          amount: '200.00',
          category: 'Income',
          type: 'income',
          paymentMethod: null,
          isRecurring: null,
          subcategory: null,
          budgetMonth: 2,
          budgetYear: 2023,
          balance: null,
          reference: null,
          notes: null,
          importHash: null
        },
        {
          userId,
          date: '2023-03-15',
          description: 'March Transaction',
          amount: '300.00',
          category: 'Income',
          type: 'income',
          paymentMethod: null,
          isRecurring: null,
          subcategory: null,
          budgetMonth: 3,
          budgetYear: 2023,
          balance: null,
          reference: null,
          notes: null,
          importHash: null
        }
      ]);
    });
    
    it('correctly filters transactions by budget month and year', async () => {
      const transactions = await storage.getTransactionsByBudgetMonth(userId, 2, 2023);
      
      expect(transactions).toHaveLength(1);
      expect(transactions[0].description).toBe('February Transaction');
      expect(transactions[0].budgetMonth).toBe(2);
      expect(transactions[0].budgetYear).toBe(2023);
    });
    
    it('returns empty array for non-existent budget month', async () => {
      const transactions = await storage.getTransactionsByBudgetMonth(userId, 5, 2023);
      
      expect(transactions).toHaveLength(0);
    });
    
    it('returns empty array for non-existent budget year', async () => {
      const transactions = await storage.getTransactionsByBudgetMonth(userId, 2, 2022);
      
      expect(transactions).toHaveLength(0);
    });
  });
}); 