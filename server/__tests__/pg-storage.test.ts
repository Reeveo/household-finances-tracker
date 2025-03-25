import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { PgStorage } from '../pg-storage';
import { pool } from '../db';
import { User, InsertUser, Transaction, InsertTransaction } from './mocks/schema.mock';

// Mock the database pool
vi.mock('../db', () => ({
  pool: {
    query: vi.fn(),
    connect: vi.fn()
  }
}));

describe('PgStorage', () => {
  let storage: PgStorage;
  
  beforeEach(() => {
    storage = new PgStorage();
    vi.clearAllMocks();
  });
  
  afterEach(() => {
    vi.resetAllMocks();
  });
  
  describe('User Methods', () => {
    it('getUser should return a user when found', async () => {
      const mockUser = { id: 1, username: 'testuser', name: 'Test User', email: 'test@example.com' };
      
      // Mock the database response
      vi.mocked(pool.query).mockResolvedValueOnce({
        rows: [mockUser],
        rowCount: 1
      } as any);
      
      const result = await storage.getUser(1);
      
      // Verify the correct query was executed
      expect(pool.query).toHaveBeenCalledWith(
        'SELECT * FROM users WHERE id = $1',
        ['1']
      );
      
      // Verify the result
      expect(result).toEqual(mockUser);
    });
    
    it('getUser should return undefined when user not found', async () => {
      // Mock an empty response
      vi.mocked(pool.query).mockResolvedValueOnce({
        rows: [],
        rowCount: 0
      } as any);
      
      const result = await storage.getUser(999);
      
      expect(pool.query).toHaveBeenCalledWith(
        'SELECT * FROM users WHERE id = $1',
        ['999']
      );
      
      expect(result).toBeUndefined();
    });
    
    it('getUserByUsername should find user by username', async () => {
      const mockUser = { id: 1, username: 'testuser', name: 'Test User', email: 'test@example.com' };
      
      vi.mocked(pool.query).mockResolvedValueOnce({
        rows: [mockUser],
        rowCount: 1
      } as any);
      
      const result = await storage.getUserByUsername('testuser');
      
      expect(pool.query).toHaveBeenCalledWith(
        'SELECT * FROM users WHERE username = $1',
        ['testuser']
      );
      
      expect(result).toEqual(mockUser);
    });
    
    it('createUser should insert a new user', async () => {
      const mockInsertUser: InsertUser = {
        username: 'newuser',
        name: 'New User',
        email: 'new@example.com',
        passwordHash: 'hashedpassword',
        passwordSalt: 'salt'
      };
      
      const mockCreatedUser = { id: 2, ...mockInsertUser };
      
      vi.mocked(pool.query).mockResolvedValueOnce({
        rows: [mockCreatedUser],
        rowCount: 1
      } as any);
      
      const result = await storage.createUser(mockInsertUser);
      
      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO users'),
        expect.arrayContaining([
          mockInsertUser.username,
          mockInsertUser.name,
          mockInsertUser.email,
          mockInsertUser.passwordHash,
          mockInsertUser.passwordSalt
        ])
      );
      
      expect(result).toEqual(mockCreatedUser);
    });
    
    it('updateUser should update user properties', async () => {
      const userId = 1;
      const updates = { name: 'Updated Name', email: 'updated@example.com' };
      const mockUpdatedUser = { id: userId, username: 'testuser', ...updates };
      
      vi.mocked(pool.query).mockResolvedValueOnce({
        rows: [mockUpdatedUser],
        rowCount: 1
      } as any);
      
      const result = await storage.updateUser(userId, updates);
      
      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE users SET'),
        expect.arrayContaining([userId.toString()])
      );
      
      expect(result).toEqual(mockUpdatedUser);
    });
  });
  
  describe('Transaction Methods', () => {
    it('getTransactions should return user transactions', async () => {
      const mockTransactions = [
        { id: 1, userId: 1, description: 'Transaction 1', amount: 100, date: new Date() },
        { id: 2, userId: 1, description: 'Transaction 2', amount: 200, date: new Date() }
      ];
      
      vi.mocked(pool.query).mockResolvedValueOnce({
        rows: mockTransactions,
        rowCount: 2
      } as any);
      
      const result = await storage.getTransactions(1);
      
      expect(pool.query).toHaveBeenCalledWith(
        'SELECT * FROM transactions WHERE user_id = $1 ORDER BY date DESC',
        ['1']
      );
      
      expect(result).toEqual(mockTransactions);
    });
    
    it('createTransaction should insert a new transaction', async () => {
      const mockTransaction: InsertTransaction = {
        userId: 1,
        description: 'New Transaction',
        amount: 150.50,
        date: new Date('2023-05-15'),
        category: 'Food',
        paymentMethod: 'Credit Card'
      };
      
      const mockCreatedTransaction = { id: 1, ...mockTransaction };
      
      vi.mocked(pool.query).mockResolvedValueOnce({
        rows: [mockCreatedTransaction],
        rowCount: 1
      } as any);
      
      const result = await storage.createTransaction(mockTransaction);
      
      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO transactions'),
        expect.arrayContaining([
          mockTransaction.userId.toString(),
          mockTransaction.description,
          mockTransaction.amount.toString()
        ])
      );
      
      expect(result).toEqual(mockCreatedTransaction);
    });
    
    it('getTransactionsByDateRange should filter by date range', async () => {
      const mockTransactions = [
        { id: 1, userId: 1, description: 'Transaction 1', amount: 100, date: new Date('2023-01-15') },
        { id: 2, userId: 1, description: 'Transaction 2', amount: 200, date: new Date('2023-01-20') }
      ];
      
      vi.mocked(pool.query).mockResolvedValueOnce({
        rows: mockTransactions,
        rowCount: 2
      } as any);
      
      const startDate = new Date('2023-01-01');
      const endDate = new Date('2023-01-31');
      
      const result = await storage.getTransactionsByDateRange(1, startDate, endDate);
      
      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('WHERE user_id = $1 AND date BETWEEN $2 AND $3'),
        ['1', startDate.toISOString(), endDate.toISOString()]
      );
      
      expect(result).toEqual(mockTransactions);
    });
    
    it('createManyTransactions should handle batch inserts', async () => {
      const mockTransactions: InsertTransaction[] = [
        {
          userId: 1,
          description: 'Transaction 1',
          amount: 100,
          date: new Date('2023-01-15'),
          category: 'Food',
          paymentMethod: 'Credit Card'
        },
        {
          userId: 1,
          description: 'Transaction 2',
          amount: 200,
          date: new Date('2023-01-20'),
          category: 'Entertainment',
          paymentMethod: 'Debit Card'
        }
      ];
      
      const mockCreatedTransactions = mockTransactions.map((t, i) => ({ id: i + 1, ...t }));
      
      // Mock the client for transaction
      const mockClient = {
        query: vi.fn(),
        release: vi.fn()
      };
      
      vi.mocked(pool.query).mockImplementation(async (sql, params) => {
        if (sql.includes('INSERT INTO transactions')) {
          const index = parseInt(params[0]) - 1;
          return { rows: [mockCreatedTransactions[index]], rowCount: 1 } as any;
        }
        return { rows: [], rowCount: 0 } as any;
      });
      
      vi.spyOn(pool, 'connect').mockResolvedValue(mockClient as any);
      
      const result = await storage.createManyTransactions(mockTransactions);
      
      // Should have the same number of created transactions
      expect(result.length).toEqual(mockTransactions.length);
    });
  });
  
  describe('Error Handling', () => {
    it('should throw errors when database queries fail', async () => {
      const mockError = new Error('Database error');
      
      vi.mocked(pool.query).mockRejectedValueOnce(mockError);
      
      await expect(storage.getUser(1)).rejects.toThrow('Database error');
    });
    
    it('should handle transaction failures', async () => {
      // Mock the client for a failing transaction
      const mockClient = {
        query: vi.fn().mockRejectedValue(new Error('Transaction failed')),
        release: vi.fn()
      };
      
      vi.spyOn(pool, 'connect').mockResolvedValue(mockClient as any);
      
      const mockTransaction: InsertTransaction = {
        userId: 1,
        description: 'Failing Transaction',
        amount: 100,
        date: new Date(),
        category: 'Test',
        paymentMethod: 'Cash'
      };
      
      await expect(storage.createTransaction(mockTransaction)).rejects.toThrow('Transaction failed');
    });
  });
}); 