import { describe, it, expect, beforeEach, vi } from 'vitest';
import { MemStorage } from '../storage';

describe('MemStorage', () => {
  let storage: MemStorage;
  
  beforeEach(() => {
    // Create a fresh instance for each test
    storage = new MemStorage();
  });
  
  describe('User methods', () => {
    it('creates and retrieves a user', async () => {
      const userInput = {
        username: 'testuser',
        password: 'password123',
        name: 'Test User',
        email: 'test@example.com'
      };
      
      const createdUser = await storage.createUser(userInput);
      
      expect(createdUser.id).toBeDefined();
      expect(createdUser.username).toBe(userInput.username);
      expect(createdUser.name).toBe(userInput.name);
      expect(createdUser.email).toBe(userInput.email);
      expect(createdUser.password).toBe(userInput.password);
      expect(createdUser.createdAt).toBeInstanceOf(Date);
      
      // Test getUser
      const retrievedUser = await storage.getUser(createdUser.id);
      expect(retrievedUser).toEqual(createdUser);
      
      // Test getUserByUsername
      const retrievedByUsername = await storage.getUserByUsername('testuser');
      expect(retrievedByUsername).toEqual(createdUser);
      
      // Test getUserByEmail
      const retrievedByEmail = await storage.getUserByEmail('test@example.com');
      expect(retrievedByEmail).toEqual(createdUser);
    });
    
    it('returns undefined for non-existent user', async () => {
      const user = await storage.getUser(999);
      expect(user).toBeUndefined();
      
      const userByUsername = await storage.getUserByUsername('nonexistent');
      expect(userByUsername).toBeUndefined();
      
      const userByEmail = await storage.getUserByEmail('nonexistent@example.com');
      expect(userByEmail).toBeUndefined();
    });
  });
  
  describe('Transaction methods', () => {
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
    
    it('creates and retrieves a transaction', async () => {
      const transactionInput = {
        userId,
        date: '2023-06-15',
        description: 'Test Transaction',
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
      };
      
      const createdTransaction = await storage.createTransaction(transactionInput);
      
      expect(createdTransaction.id).toBeDefined();
      expect(createdTransaction.userId).toBe(userId);
      expect(createdTransaction.description).toBe('Test Transaction');
      expect(createdTransaction.amount).toBe('100.00');
      expect(createdTransaction.category).toBe('Income');
      expect(createdTransaction.createdAt).toBeInstanceOf(Date);
      
      // Test getTransactionById
      const retrievedTransaction = await storage.getTransactionById(createdTransaction.id);
      expect(retrievedTransaction).toEqual(createdTransaction);
      
      // Test getTransactions
      const allTransactions = await storage.getTransactions(userId);
      expect(allTransactions).toHaveLength(1);
      expect(allTransactions[0]).toEqual(createdTransaction);
    });
    
    it('creates multiple transactions in batch', async () => {
      const transactionInputs = [
        {
          userId,
          date: '2023-06-15',
          description: 'Transaction 1',
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
          importHash: 'hash1'
        },
        {
          userId,
          date: '2023-06-16',
          description: 'Transaction 2',
          amount: '-50.00',
          category: 'Essentials',
          subcategory: 'Groceries',
          type: 'expense',
          paymentMethod: 'Credit Card',
          isRecurring: false,
          budgetMonth: null,
          balance: null,
          reference: null,
          notes: null,
          importHash: 'hash2'
        }
      ];
      
      const createdTransactions = await storage.createManyTransactions(transactionInputs);
      
      expect(createdTransactions).toHaveLength(2);
      expect(createdTransactions[0].description).toBe('Transaction 1');
      expect(createdTransactions[1].description).toBe('Transaction 2');
      
      // Test getTransactions
      const allTransactions = await storage.getTransactions(userId);
      expect(allTransactions).toHaveLength(2);
    });
    
    it('updates a transaction', async () => {
      // Create a transaction first
      const transaction = await storage.createTransaction({
        userId,
        date: '2023-06-15',
        description: 'Original Description',
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
      
      // Update the transaction
      const updatedTransaction = await storage.updateTransaction(transaction.id, {
        description: 'Updated Description',
        amount: '150.00'
      });
      
      expect(updatedTransaction).toBeDefined();
      expect(updatedTransaction!.id).toBe(transaction.id);
      expect(updatedTransaction!.description).toBe('Updated Description');
      expect(updatedTransaction!.amount).toBe('150.00');
      expect(updatedTransaction!.category).toBe('Income'); // Unchanged field
      
      // Verify the update in storage
      const retrievedTransaction = await storage.getTransactionById(transaction.id);
      expect(retrievedTransaction!.description).toBe('Updated Description');
      expect(retrievedTransaction!.amount).toBe('150.00');
    });
    
    it('deletes a transaction', async () => {
      // Create a transaction first
      const transaction = await storage.createTransaction({
        userId,
        date: '2023-06-15',
        description: 'To Be Deleted',
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
      
      // Verify it exists
      let retrievedTransaction = await storage.getTransactionById(transaction.id);
      expect(retrievedTransaction).toBeDefined();
      
      // Delete the transaction
      const result = await storage.deleteTransaction(transaction.id);
      expect(result).toBe(true);
      
      // Verify it's gone
      retrievedTransaction = await storage.getTransactionById(transaction.id);
      expect(retrievedTransaction).toBeUndefined();
    });
    
    it('filters transactions by date range', async () => {
      // Create transactions with different dates
      await storage.createManyTransactions([
        {
          userId,
          date: '2023-01-01',
          description: 'January Transaction',
          amount: '100.00',
          category: 'Income',
          type: 'income',
          paymentMethod: null,
          isRecurring: null,
          subcategory: null,
          budgetMonth: null,
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
          budgetMonth: null,
          balance: null,
          reference: null,
          notes: null,
          importHash: null
        },
        {
          userId,
          date: '2023-03-20',
          description: 'March Transaction',
          amount: '300.00',
          category: 'Income',
          type: 'income',
          paymentMethod: null,
          isRecurring: null,
          subcategory: null,
          budgetMonth: null,
          balance: null,
          reference: null,
          notes: null,
          importHash: null
        }
      ]);
      
      // Test date range filtering
      const transactions = await storage.getTransactionsByDateRange(
        userId,
        new Date('2023-01-15'),
        new Date('2023-03-01')
      );
      
      expect(transactions).toHaveLength(1);
      expect(transactions[0].description).toBe('February Transaction');
    });
    
    it('filters transactions by category', async () => {
      // Create transactions with different categories
      await storage.createManyTransactions([
        {
          userId,
          date: '2023-01-01',
          description: 'Salary',
          amount: '2000.00',
          category: 'Income',
          type: 'income',
          paymentMethod: null,
          isRecurring: null,
          subcategory: null,
          budgetMonth: null,
          balance: null,
          reference: null,
          notes: null,
          importHash: null
        },
        {
          userId,
          date: '2023-01-05',
          description: 'Groceries',
          amount: '-150.00',
          category: 'Essentials',
          type: 'expense',
          paymentMethod: null,
          isRecurring: null,
          subcategory: null,
          budgetMonth: null,
          balance: null,
          reference: null,
          notes: null,
          importHash: null
        },
        {
          userId,
          date: '2023-01-10',
          description: 'Restaurant',
          amount: '-80.00',
          category: 'Lifestyle',
          type: 'expense',
          paymentMethod: null,
          isRecurring: null,
          subcategory: null,
          budgetMonth: null,
          balance: null,
          reference: null,
          notes: null,
          importHash: null
        }
      ]);
      
      // Test category filtering
      const transactions = await storage.getTransactionsByCategory(userId, 'Essentials');
      
      expect(transactions).toHaveLength(1);
      expect(transactions[0].description).toBe('Groceries');
    });
    
    it('gets transactions by import hash', async () => {
      // Create a transaction with an import hash
      const importHash = 'unique-import-hash';
      
      await storage.createTransaction({
        userId,
        date: '2023-06-15',
        description: 'Imported Transaction',
        amount: '100.00',
        category: 'Income',
        type: 'income',
        paymentMethod: null,
        isRecurring: null,
        subcategory: null,
        budgetMonth: null,
        balance: null,
        reference: null,
        notes: null,
        importHash
      });
      
      // Test retrieving by import hash
      const transaction = await storage.getTransactionByImportHash(importHash);
      
      expect(transaction).toBeDefined();
      expect(transaction!.description).toBe('Imported Transaction');
      expect(transaction!.importHash).toBe(importHash);
    });
  });
});