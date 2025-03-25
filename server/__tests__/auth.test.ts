import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import express, { Express, Request, Response, NextFunction } from 'express';
import request from 'supertest';
import { setupAuth } from '../auth';
import { storage } from '../storage';
import session from 'express-session';

// Mock storage methods
vi.mock('../storage', () => {
  return {
    storage: {
      getUser: vi.fn(),
      getUserByUsername: vi.fn(),
      getUserByEmail: vi.fn(),
      createUser: vi.fn(),
      sessionStore: {
        get: vi.fn(),
        set: vi.fn(),
        destroy: vi.fn(),
      }
    }
  };
});

// Mock express-session
vi.mock('express-session', () => {
  const sessionMiddleware = (req: any, res: Response, next: NextFunction) => {
    req.session = {
      id: 'mock-session-id',
      userId: null,
      save: vi.fn((callback) => {
        if (callback) callback(null);
        return true;
      }),
      regenerate: vi.fn((callback) => {
        if (callback) callback(null);
        return true;
      }),
      destroy: vi.fn((callback) => {
        if (callback) callback(null);
        return true;
      }),
    };
    next();
  };
  
  return vi.fn(() => sessionMiddleware);
});

describe('Authentication', () => {
  let app: Express;
  
  beforeEach(async () => {
    // Reset all mocks
    vi.resetAllMocks();
    
    // Create a fresh Express app for each test
    app = express();
    app.use(express.json());
    
    // Configure session
    app.use(session({
      secret: 'test-secret',
      resave: false,
      saveUninitialized: false
    }));
    
    // Setup auth routes and middleware
    setupAuth(app);
    
    // Add a protected route for testing
    app.get('/api/protected', (req: any, res: Response) => {
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      res.json({ user: req.user });
    });
  });
  
  describe('Registration', () => {
    it('registers a new user with valid credentials', async () => {
      // Mock storage.createUser to return a new user
      const mockUser = {
        id: 1,
        username: 'newuser',
        name: 'New User',
        email: 'newuser@example.com',
        password: 'hashedpassword123',
        createdAt: new Date()
      };
      
      storage.getUserByUsername.mockResolvedValue(undefined);
      storage.getUserByEmail.mockResolvedValue(undefined);
      storage.createUser.mockResolvedValue(mockUser);
      
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'newuser',
          password: 'Password123!',
          name: 'New User',
          email: 'newuser@example.com'
        });
      
      expect(res.status).toBe(201);
      expect(res.body.id).toBe(1);
      expect(res.body.username).toBe('newuser');
      
      // Password should not be returned in the response
      expect(res.body.password).toBeUndefined();
      
      // Session should be set
      expect(res.header['set-cookie']).toBeDefined();
    });
    
    it('returns error for existing username', async () => {
      // Mock existing user
      storage.getUserByUsername.mockResolvedValue({ id: 1, username: 'existinguser' });
      
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'existinguser',
          password: 'Password123!',
          name: 'Existing User',
          email: 'new@example.com'
        });
      
      expect(res.status).toBe(400);
      expect(res.body.error).toContain('Username already exists');
      expect(storage.createUser).not.toHaveBeenCalled();
    });
    
    it('returns error for existing email', async () => {
      // Mock existing email but not username
      storage.getUserByUsername.mockResolvedValue(undefined);
      storage.getUserByEmail.mockResolvedValue({ id: 1, email: 'existing@example.com' });
      
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'newuser',
          password: 'Password123!',
          name: 'New User',
          email: 'existing@example.com'
        });
      
      expect(res.status).toBe(400);
      expect(res.body.error).toContain('Email already registered');
      expect(storage.createUser).not.toHaveBeenCalled();
    });
    
    it('validates required fields during registration', async () => {
      // Missing username
      let res = await request(app)
        .post('/api/auth/register')
        .send({
          password: 'Password123!',
          name: 'New User',
          email: 'newuser@example.com'
        });
      
      expect(res.status).toBe(400);
      expect(res.body.error).toContain('username is required');
      
      // Missing password
      res = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'newuser',
          name: 'New User',
          email: 'newuser@example.com'
        });
      
      expect(res.status).toBe(400);
      expect(res.body.error).toContain('password is required');
      
      // Missing email
      res = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'newuser',
          password: 'Password123!',
          name: 'New User'
        });
      
      expect(res.status).toBe(400);
      expect(res.body.error).toContain('email is required');
    });
    
    it('validates password strength during registration', async () => {
      // Too short password
      let res = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'newuser',
          password: 'weak',
          name: 'New User',
          email: 'newuser@example.com'
        });
      
      expect(res.status).toBe(400);
      expect(res.body.error).toContain('Password must be at least 8 characters');
      
      // No uppercase letter
      res = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'newuser',
          password: 'password123!',
          name: 'New User',
          email: 'newuser@example.com'
        });
      
      expect(res.status).toBe(400);
      expect(res.body.error).toContain('Password must include at least one uppercase letter');
      
      // No number
      res = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'newuser',
          password: 'Password!',
          name: 'New User',
          email: 'newuser@example.com'
        });
      
      expect(res.status).toBe(400);
      expect(res.body.error).toContain('Password must include at least one number');
    });
  });
  
  describe('Login', () => {
    it('logs in with valid credentials', async () => {
      // Mock user with hashed password (using a simple hash for testing)
      const hashedPassword = 'hashed_Password123!';
      const mockUser = {
        id: 1,
        username: 'existinguser',
        name: 'Existing User',
        email: 'existing@example.com',
        password: hashedPassword,
        createdAt: new Date()
      };
      
      // Mock storage and password verification
      storage.getUserByUsername.mockResolvedValue(mockUser);
      
      // Mock the password verification
      vi.spyOn(global.crypto.subtle, 'verify').mockImplementation(() => Promise.resolve(true));
      
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'existinguser',
          password: 'Password123!'
        });
      
      expect(res.status).toBe(200);
      expect(res.body.id).toBe(1);
      expect(res.body.username).toBe('existinguser');
      
      // Password should not be returned in the response
      expect(res.body.password).toBeUndefined();
      
      // Session should be set
      expect(res.header['set-cookie']).toBeDefined();
    });
    
    it('returns error for non-existent user', async () => {
      // Mock non-existent user
      storage.getUserByUsername.mockResolvedValue(undefined);
      
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'nonexistent',
          password: 'Password123!'
        });
      
      expect(res.status).toBe(401);
      expect(res.body.error).toContain('Invalid username or password');
    });
    
    it('returns error for invalid password', async () => {
      // Mock user
      const hashedPassword = 'hashed_Password123!';
      const mockUser = {
        id: 1,
        username: 'existinguser',
        password: hashedPassword
      };
      
      // Mock storage and password verification
      storage.getUserByUsername.mockResolvedValue(mockUser);
      
      // Mock password verification to fail
      vi.spyOn(global.crypto.subtle, 'verify').mockImplementation(() => Promise.resolve(false));
      
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'existinguser',
          password: 'WrongPassword123!'
        });
      
      expect(res.status).toBe(401);
      expect(res.body.error).toContain('Invalid username or password');
    });
  });
  
  describe('Logout', () => {
    it('logs out successfully', async () => {
      const res = await request(app)
        .post('/api/auth/logout');
      
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });
  
  describe('Authentication Middleware', () => {
    it('allows access to authenticated users', async () => {
      // Setup mock authenticated user
      app.use((req: any, res, next) => {
        req.user = { id: 1, username: 'testuser' };
        next();
      });
      
      const res = await request(app)
        .get('/api/protected');
      
      expect(res.status).toBe(200);
      expect(res.body.user).toBeDefined();
      expect(res.body.user.id).toBe(1);
    });
    
    it('blocks access to unauthenticated users', async () => {
      // No mock user setup - should be unauthenticated
      
      const res = await request(app)
        .get('/api/protected');
      
      expect(res.status).toBe(401);
      expect(res.body.error).toBe('Unauthorized');
    });
  });
  
  describe('Session Management', () => {
    it('loads user from session', async () => {
      // Mock session with userId
      app.use((req: any, res, next) => {
        req.session.userId = 1;
        next();
      });
      
      // Mock user retrieval
      const mockUser = {
        id: 1,
        username: 'sessionuser',
        name: 'Session User',
        email: 'session@example.com',
        createdAt: new Date()
      };
      
      storage.getUser.mockResolvedValue(mockUser);
      
      const res = await request(app)
        .get('/api/protected');
      
      expect(res.status).toBe(200);
      expect(res.body.user).toBeDefined();
      expect(res.body.user.id).toBe(1);
    });
    
    it('handles session without user', async () => {
      // Mock invalid session (userId exists but user doesn't)
      app.use((req: any, res, next) => {
        req.session.userId = 999; // non-existent user
        next();
      });
      
      // Mock user retrieval (user not found)
      storage.getUser.mockResolvedValue(undefined);
      
      const res = await request(app)
        .get('/api/protected');
      
      expect(res.status).toBe(401);
      expect(res.body.error).toBe('Unauthorized');
    });
  });
}); 