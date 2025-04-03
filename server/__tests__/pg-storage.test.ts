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
        password: 'hashedpassword'
      };
      
      const mockCreatedUser = { id: 2, ...mockInsertUser };
      
      vi.mocked(pool.query).mockResolvedValueOnce({
        rows: [mockCreatedUser],
        rowCount: 1
      } as any);
      
      const result = await storage.createUser(mockInsertUser);
      
      expect(pool.query).toHaveBeenCalledWith(
        'INSERT INTO users (username, password, name, email, created_at) VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP) RETURNING *',
        ['newuser', 'hashedpassword', 'New User', 'new@example.com']
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
      
      // Check that the query contains UPDATE users SET and that the parameters array includes the userId
      expect(pool.query).toHaveBeenCalledWith(
        expect.stringMatching(/UPDATE users.*SET.*name.*email.*WHERE id/s),
        ['Updated Name', 'updated@example.com', '1']
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
        [1]
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
      
      // Verify the SQL contains INSERT INTO transactions and the parameters include the transaction values
      expect(pool.query).toHaveBeenCalledWith(
        expect.stringMatching(/INSERT INTO transactions/),
        expect.arrayContaining([
          1, // userId
          expect.any(Date), // date
          mockTransaction.type,
          150.50, // amount
          'Food', // category
          undefined, // subcategory
          'New Transaction', // description
          // Other parameters can be undefined
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
      
      // Verify SQL uses the correct format and date comparison
      expect(pool.query).toHaveBeenCalledWith(
        'SELECT * FROM transactions WHERE user_id = $1 AND date >= $2 AND date <= $3 ORDER BY date DESC',
        [1, '2023-01-01', '2023-01-31']
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
        query: vi.fn().mockImplementation((sql, params) => {
          // For BEGIN and COMMIT queries
          if (sql === 'BEGIN' || sql === 'COMMIT' || sql === 'ROLLBACK') {
            return Promise.resolve({ rows: [], rowCount: 0 });
          }
          // For INSERT queries
          if (sql.includes('INSERT INTO transactions')) {
            // Return the appropriate created transaction based on the description
            const description = params[6]; // Description is the 7th parameter
            const index = description === 'Transaction 1' ? 0 : 1;
            return Promise.resolve({ 
              rows: [mockCreatedTransactions[index]], 
              rowCount: 1 
            });
          }
          return Promise.resolve({ rows: [], rowCount: 0 });
        }),
        release: vi.fn()
      };
      
      // Mock the pool.connect to return our mockClient
      vi.mocked(pool.connect).mockResolvedValue(mockClient as any);
      
      const result = await storage.createManyTransactions(mockTransactions);
      
      // Verify connect was called
      expect(pool.connect).toHaveBeenCalled();
      
      // Verify BEGIN was called
      expect(mockClient.query).toHaveBeenCalledWith('BEGIN');
      
      // Verify each transaction was inserted
      expect(mockClient.query).toHaveBeenCalledWith(
        expect.stringMatching(/INSERT INTO transactions/),
        expect.arrayContaining([1, expect.any(Date), undefined, 100, 'Food', undefined, 'Transaction 1'])
      );
      
      expect(mockClient.query).toHaveBeenCalledWith(
        expect.stringMatching(/INSERT INTO transactions/),
        expect.arrayContaining([1, expect.any(Date), undefined, 200, 'Entertainment', undefined, 'Transaction 2'])
      );
      
      // Verify COMMIT was called
      expect(mockClient.query).toHaveBeenCalledWith('COMMIT');
      
      // Verify client was released
      expect(mockClient.release).toHaveBeenCalled();
      
      // Verify result contains the created transactions
      expect(result).toEqual(mockCreatedTransactions);
    });
  });
  
  describe('Error Handling', () => {
    it('should throw errors when database queries fail', async () => {
      // Mock a database error
      vi.mocked(pool.query).mockRejectedValueOnce(new Error('Database error'));
      
      // Attempt to get a user, which should fail
      await expect(storage.getUser(1)).rejects.toThrow('Database error');
    });
    
    it('should handle transaction failures', async () => {
      // Mock transaction data
      const mockTransaction: InsertTransaction = {
        userId: 1,
        description: 'Failed Transaction',
        amount: 100,
        date: new Date(),
        category: 'Test'
      };
      
      // Set up pool.query to throw a specific error
      vi.mocked(pool.query).mockImplementation(() => {
        throw new Error('Cannot read properties of undefined (reading \'rows\')');
      });
      
      // The test should expect the specific error that's actually being thrown
      await expect(storage.createTransaction(mockTransaction))
        .rejects.toThrow('Cannot read properties of undefined');
    });
  });
}); 