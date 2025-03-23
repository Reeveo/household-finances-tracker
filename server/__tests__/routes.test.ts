import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import express, { Express } from 'express';
import request from 'supertest';
import { registerRoutes } from '../routes';
import { storage } from '../storage';
import { setupAuth } from '../auth';

// Mock storage methods
vi.mock('../storage', () => ({
  storage: {
    getUser: vi.fn(),
    getUserByUsername: vi.fn(),
    createUser: vi.fn(),
    getTransactions: vi.fn(),
    getTransactionById: vi.fn(),
    createTransaction: vi.fn(),
    createManyTransactions: vi.fn(),
    updateTransaction: vi.fn(),
    deleteTransaction: vi.fn(),
    getTransactionsByDateRange: vi.fn(),
    getTransactionsByCategory: vi.fn(),
    getTransactionsByBudgetMonth: vi.fn(),
    getTransactionByImportHash: vi.fn(),
    sessionStore: {
      get: vi.fn(),
      set: vi.fn(),
      destroy: vi.fn(),
    }
  }
}));

// Mock auth
vi.mock('../auth', () => ({
  setupAuth: vi.fn((app) => {
    // Mock authentication middleware for testing
    app.use((req, res, next) => {
      // For testing, we'll manually set req.user when needed
      next();
    });
  })
}));

describe('API Routes', () => {
  let app: Express;
  let server: any;
  
  beforeEach(async () => {
    // Reset all mocks
    vi.resetAllMocks();
    
    // Create a fresh Express app for each test
    app = express();
    app.use(express.json());
    
    // Configure mock auth
    setupAuth(app);
    
    // Register routes
    server = await registerRoutes(app);
  });
  
  afterEach(() => {
    server.close();
  });
  
  describe('Transaction Routes', () => {
    it('GET /api/transactions returns transactions for a user', async () => {
      // Mock data
      const mockTransactions = [
        {
          id: 1,
          userId: 1,
          description: 'Transaction 1',
          amount: '100.00',
          category: 'Income',
          date: '2023-06-15',
          createdAt: new Date()
        },
        {
          id: 2,
          userId: 1,
          description: 'Transaction 2',
          amount: '-50.00',
          category: 'Essentials',
          date: '2023-06-16',
          createdAt: new Date()
        }
      ];
      
      // Mock storage implementation
      storage.getTransactions.mockResolvedValue(mockTransactions);
      
      // Mock authenticated user
      const res = await request(app)
        .get('/api/transactions')
        .set('user', JSON.stringify({ id: 1 }));  // Setting user for test purposes
      
      // Assertions
      expect(res.status).toBe(200);
      expect(res.body).toEqual(mockTransactions);
      expect(storage.getTransactions).toHaveBeenCalledWith(1);
    });
    
    it('GET /api/transactions with date range returns filtered transactions', async () => {
      // Mock data
      const mockTransactions = [
        {
          id: 2,
          userId: 1,
          description: 'Transaction in date range',
          amount: '-50.00',
          category: 'Essentials',
          date: '2023-02-01',
          createdAt: new Date()
        }
      ];
      
      // Mock storage implementation
      storage.getTransactionsByDateRange.mockResolvedValue(mockTransactions);
      
      // Mock authenticated user
      const res = await request(app)
        .get('/api/transactions?startDate=2023-01-01&endDate=2023-03-01')
        .set('user', JSON.stringify({ id: 1 }));  // Setting user for test purposes
      
      // Assertions
      expect(res.status).toBe(200);
      expect(res.body).toEqual(mockTransactions);
      expect(storage.getTransactionsByDateRange).toHaveBeenCalledWith(
        1,
        expect.any(Date),
        expect.any(Date)
      );
    });
    
    it('POST /api/transactions creates a new transaction', async () => {
      // Mock data
      const mockTransactionInput = {
        description: 'New Transaction',
        amount: '100.00',
        category: 'Income',
        date: '2023-06-15',
        type: 'income'
      };
      
      const mockCreatedTransaction = {
        id: 1,
        userId: 1,
        description: 'New Transaction',
        amount: '100.00',
        category: 'Income',
        date: '2023-06-15',
        type: 'income',
        createdAt: new Date()
      };
      
      // Mock storage implementation
      storage.createTransaction.mockResolvedValue(mockCreatedTransaction);
      
      // Mock authenticated user
      const res = await request(app)
        .post('/api/transactions')
        .set('user', JSON.stringify({ id: 1 }))  // Setting user for test purposes
        .send(mockTransactionInput);
      
      // Assertions
      expect(res.status).toBe(201);
      expect(res.body).toEqual(mockCreatedTransaction);
      expect(storage.createTransaction).toHaveBeenCalledWith({
        ...mockTransactionInput,
        userId: 1
      });
    });
    
    it('POST /api/transactions/batch creates multiple transactions', async () => {
      // Mock data
      const mockTransactionInputs = [
        {
          description: 'Transaction 1',
          amount: '100.00',
          category: 'Income',
          date: '2023-06-15',
          type: 'income'
        },
        {
          description: 'Transaction 2',
          amount: '-50.00',
          category: 'Essentials',
          date: '2023-06-16',
          type: 'expense'
        }
      ];
      
      const mockCreatedTransactions = [
        {
          id: 1,
          userId: 1,
          description: 'Transaction 1',
          amount: '100.00',
          category: 'Income',
          date: '2023-06-15',
          type: 'income',
          createdAt: new Date()
        },
        {
          id: 2,
          userId: 1,
          description: 'Transaction 2',
          amount: '-50.00',
          category: 'Essentials',
          date: '2023-06-16',
          type: 'expense',
          createdAt: new Date()
        }
      ];
      
      // Mock storage implementation
      storage.createManyTransactions.mockResolvedValue(mockCreatedTransactions);
      
      // Mock authenticated user
      const res = await request(app)
        .post('/api/transactions/batch')
        .set('user', JSON.stringify({ id: 1 }))  // Setting user for test purposes
        .send({ transactions: mockTransactionInputs });
      
      // Assertions
      expect(res.status).toBe(201);
      expect(res.body.created).toEqual(mockCreatedTransactions);
      expect(res.body.stats.created).toBe(2);
      expect(storage.createManyTransactions).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ userId: 1, description: 'Transaction 1' }),
          expect.objectContaining({ userId: 1, description: 'Transaction 2' })
        ])
      );
    });
  });
});