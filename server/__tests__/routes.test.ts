import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import express, { Express } from 'express';
import request from 'supertest';
import { registerRoutes } from '../routes';
import { storage } from '../storage';
import { setupAuth } from '../auth';

// Import types
import { Transaction } from '../storage';

// Mock storage methods with proper types
vi.mock('../storage', () => {
  return {
    storage: {
      getUser: vi.fn().mockReturnValue(undefined),
      getUserByUsername: vi.fn().mockReturnValue(undefined),
      createUser: vi.fn().mockReturnValue({}),
      getTransactions: vi.fn().mockReturnValue([]),
      getTransactionById: vi.fn().mockReturnValue(undefined),
      createTransaction: vi.fn().mockReturnValue({}),
      createManyTransactions: vi.fn().mockReturnValue([]),
      updateTransaction: vi.fn().mockReturnValue(undefined),
      deleteTransaction: vi.fn().mockReturnValue(true),
      getTransactionsByDateRange: vi.fn().mockReturnValue([]),
      getTransactionsByCategory: vi.fn().mockReturnValue([]),
      getTransactionsByBudgetMonth: vi.fn().mockReturnValue([]),
      getTransactionByImportHash: vi.fn().mockReturnValue(undefined),
      sessionStore: {
        get: vi.fn(),
        set: vi.fn(),
        destroy: vi.fn(),
      }
    }
  };
});

// Mock auth
vi.mock('../auth', () => ({
  setupAuth: vi.fn((app) => {
    // Mock authentication middleware for testing
    app.use((req, res, next) => {
      // For testing, we'll manually set req.user when needed
      // Add isAuthenticated method to request object
      req.isAuthenticated = () => {
        return !!req.user; // Return true if req.user exists
      };
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
    
    // Add middleware to set user from header for testing
    app.use((req, res, next) => {
      if (req.headers.user) {
        try {
          req.user = JSON.parse(req.headers.user as string);
        } catch (e) {
          console.error('Invalid user header format');
        }
      }
      next();
    });
    
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
          createdAt: new Date().toISOString()
        },
        {
          id: 2,
          userId: 1,
          description: 'Transaction 2',
          amount: '-50.00',
          category: 'Essentials',
          date: '2023-06-16',
          createdAt: new Date().toISOString()
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
          createdAt: new Date().toISOString()
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
        createdAt: new Date().toISOString()
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
    
    it('POST /api/transactions creates a new recurring transaction without end date', async () => {
      // Mock data
      const mockTransactionInput = {
        description: 'Monthly Subscription',
        amount: '-15.99',
        category: 'Lifestyle',
        subcategory: 'Entertainment',
        date: '2023-06-15',
        type: 'expense',
        isRecurring: true,
        frequency: 'monthly',
        hasEndDate: false,
        endDate: null,
        nextDueDate: '2023-07-15'
      };
      
      const mockCreatedTransaction = {
        id: 1,
        userId: 1,
        description: 'Monthly Subscription',
        amount: '-15.99',
        category: 'Lifestyle',
        subcategory: 'Entertainment',
        date: '2023-06-15',
        type: 'expense',
        isRecurring: true,
        frequency: 'monthly',
        hasEndDate: false,
        endDate: null,
        nextDueDate: '2023-07-15',
        createdAt: new Date().toISOString()
      };
      
      // Mock storage implementation
      storage.createTransaction.mockResolvedValue(mockCreatedTransaction);
      
      // Mock authenticated user
      const res = await request(app)
        .post('/api/transactions')
        .set('user', JSON.stringify({ id: 1 }))
        .send(mockTransactionInput);
      
      // Assertions
      expect(res.status).toBe(201);
      expect(res.body).toEqual(mockCreatedTransaction);
      expect(storage.createTransaction).toHaveBeenCalledWith({
        ...mockTransactionInput,
        userId: 1
      });
    });
    
    it('POST /api/transactions creates a new recurring transaction with end date', async () => {
      // Mock data
      const mockTransactionInput = {
        description: 'Gym Membership',
        amount: '-50.00',
        category: 'Lifestyle',
        subcategory: 'Fitness',
        date: '2023-06-15',
        type: 'expense',
        isRecurring: true,
        frequency: 'monthly',
        hasEndDate: true,
        endDate: '2023-12-15',
        nextDueDate: '2023-07-15'
      };
      
      const mockCreatedTransaction = {
        id: 1,
        userId: 1,
        description: 'Gym Membership',
        amount: '-50.00',
        category: 'Lifestyle',
        subcategory: 'Fitness',
        date: '2023-06-15',
        type: 'expense',
        isRecurring: true,
        frequency: 'monthly',
        hasEndDate: true,
        endDate: '2023-12-15',
        nextDueDate: '2023-07-15',
        createdAt: new Date().toISOString()
      };
      
      // Mock storage implementation
      storage.createTransaction.mockResolvedValue(mockCreatedTransaction);
      
      // Mock authenticated user
      const res = await request(app)
        .post('/api/transactions')
        .set('user', JSON.stringify({ id: 1 }))
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
          createdAt: new Date().toISOString()
        },
        {
          id: 2,
          userId: 1,
          description: 'Transaction 2',
          amount: '-50.00',
          category: 'Essentials',
          date: '2023-06-16',
          type: 'expense',
          createdAt: new Date().toISOString()
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
    
    it('POST /api/transactions/batch creates multiple recurring transactions', async () => {
      // Mock data
      const mockTransactionInputs = [
        {
          description: 'Netflix Subscription',
          amount: '-15.99',
          category: 'Lifestyle',
          subcategory: 'Entertainment',
          date: '2023-06-15',
          type: 'expense',
          isRecurring: true,
          frequency: 'monthly',
          hasEndDate: false,
          endDate: null,
          nextDueDate: '2023-07-15'
        },
        {
          description: 'Gym Membership',
          amount: '-50.00',
          category: 'Lifestyle',
          subcategory: 'Fitness',
          date: '2023-06-20',
          type: 'expense',
          isRecurring: true,
          frequency: 'monthly',
          hasEndDate: true,
          endDate: '2023-12-20',
          nextDueDate: '2023-07-20'
        }
      ];
      
      const mockCreatedTransactions = [
        {
          id: 1,
          userId: 1,
          description: 'Netflix Subscription',
          amount: '-15.99',
          category: 'Lifestyle',
          subcategory: 'Entertainment',
          date: '2023-06-15',
          type: 'expense',
          isRecurring: true,
          frequency: 'monthly',
          hasEndDate: false,
          endDate: null,
          nextDueDate: '2023-07-15',
          createdAt: new Date().toISOString()
        },
        {
          id: 2,
          userId: 1,
          description: 'Gym Membership',
          amount: '-50.00',
          category: 'Lifestyle',
          subcategory: 'Fitness',
          date: '2023-06-20',
          type: 'expense',
          isRecurring: true,
          frequency: 'monthly',
          hasEndDate: true,
          endDate: '2023-12-20',
          nextDueDate: '2023-07-20',
          createdAt: new Date().toISOString()
        }
      ];
      
      // Mock storage implementation
      storage.createManyTransactions.mockResolvedValue(mockCreatedTransactions);
      
      // Mock authenticated user
      const res = await request(app)
        .post('/api/transactions/batch')
        .set('user', JSON.stringify({ id: 1 }))
        .send({ transactions: mockTransactionInputs });
      
      // Assertions
      expect(res.status).toBe(201);
      expect(res.body.created).toEqual(mockCreatedTransactions);
      expect(res.body.stats.created).toBe(2);
      expect(storage.createManyTransactions).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ 
            userId: 1, 
            description: 'Netflix Subscription',
            isRecurring: true,
            hasEndDate: false
          }),
          expect.objectContaining({ 
            userId: 1, 
            description: 'Gym Membership',
            isRecurring: true,
            hasEndDate: true,
            endDate: '2023-12-20'
          })
        ])
      );
    });
    
    it('PATCH /api/transactions/:id updates a recurring transaction', async () => {
      // Mock data
      const transactionId = 123;
      
      // Mock original transaction
      vi.mocked(storage.getTransactionById).mockReturnValue(Promise.resolve({
        id: transactionId,
        userId: 1,
        description: 'Original Subscription',
        amount: '-15.99',
        category: 'Lifestyle',
        date: '2023-06-15',
        type: 'expense',
        isRecurring: true,
        frequency: 'monthly',
        hasEndDate: false,
        endDate: null,
        nextDueDate: '2023-07-15',
        createdAt: new Date()
      } as any));
      
      // Mock update data
      const mockTransactionUpdate = {
        description: 'Updated Subscription',
        amount: '-20.99',
        frequency: 'quarterly',
        hasEndDate: true,
        endDate: '2024-06-15',
        nextDueDate: '2023-09-15'
      };
      
      // Mock updated transaction
      const mockUpdatedTransaction = {
        id: transactionId,
        userId: 1,
        description: 'Updated Subscription',
        amount: '-20.99',
        category: 'Lifestyle',
        date: '2023-06-15',
        type: 'expense',
        isRecurring: true,
        frequency: 'quarterly',
        hasEndDate: true,
        endDate: '2024-06-15',
        nextDueDate: '2023-09-15',
        createdAt: new Date().toISOString()
      };
      
      // Mock storage implementation
      storage.updateTransaction.mockResolvedValue(mockUpdatedTransaction);
      
      // Mock authenticated user
      const res = await request(app)
        .patch(`/api/transactions/${transactionId}`)
        .set('user', JSON.stringify({ id: 1 }))
        .send(mockTransactionUpdate);
      
      // Assertions
      expect(res.status).toBe(200);
      expect(res.body).toEqual(mockUpdatedTransaction);
      expect(storage.updateTransaction).toHaveBeenCalledWith(transactionId, mockTransactionUpdate);
    });
    
    it('PATCH /api/transactions/:id converts a regular transaction to recurring', async () => {
      // Mock data
      const transactionId = 123;
      
      // Mock original transaction
      vi.mocked(storage.getTransactionById).mockReturnValue(Promise.resolve({
        id: transactionId,
        userId: 1,
        description: 'Regular Transaction',
        amount: '-50.00',
        category: 'Essentials',
        date: '2023-06-15',
        type: 'expense',
        isRecurring: false,
        createdAt: new Date()
      } as any));
      
      // Mock update data
      const mockTransactionUpdate = {
        isRecurring: true,
        frequency: 'monthly',
        hasEndDate: false,
        endDate: null,
        nextDueDate: '2023-07-15'
      };
      
      // Mock updated transaction
      const mockUpdatedTransaction = {
        id: transactionId,
        userId: 1,
        description: 'Regular Transaction',
        amount: '-50.00',
        category: 'Essentials',
        date: '2023-06-15',
        type: 'expense',
        isRecurring: true,
        frequency: 'monthly',
        hasEndDate: false,
        endDate: null,
        nextDueDate: '2023-07-15',
        createdAt: new Date().toISOString()
      };
      
      // Mock storage implementation
      storage.updateTransaction.mockResolvedValue(mockUpdatedTransaction);
      
      // Mock authenticated user
      const res = await request(app)
        .patch(`/api/transactions/${transactionId}`)
        .set('user', JSON.stringify({ id: 1 }))
        .send(mockTransactionUpdate);
      
      // Assertions
      expect(res.status).toBe(200);
      expect(res.body).toEqual(mockUpdatedTransaction);
      expect(storage.updateTransaction).toHaveBeenCalledWith(transactionId, mockTransactionUpdate);
    });
    
    it('PATCH /api/transactions/:id changes recurring settings from indefinite to end-dated', async () => {
      // Mock data
      const transactionId = 123;
      
      // Mock original transaction
      vi.mocked(storage.getTransactionById).mockReturnValue(Promise.resolve({
        id: transactionId,
        userId: 1,
        description: 'Subscription',
        amount: '-15.99',
        category: 'Lifestyle',
        date: '2023-06-15',
        type: 'expense',
        isRecurring: true,
        frequency: 'monthly',
        hasEndDate: false,
        endDate: null,
        nextDueDate: '2023-07-15',
        createdAt: new Date()
      } as any));
      
      // Mock update data
      const mockTransactionUpdate = {
        hasEndDate: true,
        endDate: '2023-12-15'
      };
      
      // Mock updated transaction
      const mockUpdatedTransaction = {
        id: transactionId,
        userId: 1,
        description: 'Subscription',
        amount: '-15.99',
        category: 'Lifestyle',
        date: '2023-06-15',
        type: 'expense',
        isRecurring: true,
        frequency: 'monthly',
        hasEndDate: true,
        endDate: '2023-12-15',
        nextDueDate: '2023-07-15',
        createdAt: new Date().toISOString()
      };
      
      // Mock storage implementation
      storage.updateTransaction.mockResolvedValue(mockUpdatedTransaction);
      
      // Mock authenticated user
      const res = await request(app)
        .patch(`/api/transactions/${transactionId}`)
        .set('user', JSON.stringify({ id: 1 }))
        .send(mockTransactionUpdate);
      
      // Assertions
      expect(res.status).toBe(200);
      expect(res.body).toEqual(mockUpdatedTransaction);
      expect(storage.updateTransaction).toHaveBeenCalledWith(transactionId, mockTransactionUpdate);
    });
  });
});