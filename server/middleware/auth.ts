import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload, VerifyOptions } from 'jsonwebtoken';
import { logSecurityError, logLoginAttempt } from '../utils/securityLogger';
import { passwordPolicy } from '../config/security';
import { User, UserRole } from '../types/user';

// JWT secret key
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

// Authentication middleware
export const authenticateToken = (req: Request, res: Response, next: NextFunction): void => {
  try {
    // Get token from header
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      res.status(401).json({
        error: 'Authentication token is required'
      });
      return;
    }

    // Verify token
    jwt.verify(token, JWT_SECRET, undefined, (err: Error | null, payload?: JwtPayload) => {
      if (err) {
        // Log authentication errors
        logSecurityError(req, err, {
          context: 'Token verification'
        });

        res.status(403).json({
          error: 'Invalid or expired token'
        });
        return;
      }

      if (!payload) {
        res.status(403).json({
          error: 'Invalid token payload'
        });
        return;
      }

      // Validate role
      const role = payload.role;
      if (!Object.values(UserRole).includes(role)) {
        res.status(403).json({
          error: 'Invalid user role'
        });
        return;
      }

      // Add user to request
      const user: User = {
        id: parseInt(payload.userId),
        username: payload.email,
        password: '', // Password is not included in the token
        name: null,
        email: payload.email,
        role: role,
        createdAt: null,
        lastLoginAt: new Date(),
        failedLoginAttempts: 0,
        lockedUntil: null,
        resetPasswordToken: null,
        resetPasswordExpires: null,
        emailVerified: false,
        twoFactorEnabled: false,
        twoFactorSecret: null,
        lastPasswordChange: null,
        lastProfileUpdate: null,
        lastSecuritySettingsUpdate: null
      };

      req.user = user;
      next();
    });
  } catch (error) {
    // Log authentication errors
    logSecurityError(req, error as Error, {
      context: 'Authentication middleware'
    });

    res.status(500).json({
      error: 'Internal server error during authentication'
    });
  }
};

// Role-based authorization middleware
export const authorize = (...roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      if (!req.user) {
        res.status(401).json({
          error: 'Authentication required'
        });
        return;
      }

      const user = req.user as User;
      if (!roles.includes(user.role)) {
        res.status(403).json({
          error: 'Insufficient permissions',
          requiredRoles: roles,
          userRole: user.role
        });
        return;
      }

      next();
    } catch (error) {
      // Log authorization errors
      const user = req.user as User;
      logSecurityError(req, error as Error, {
        context: 'Authorization middleware',
        requiredRoles: roles,
        userRole: user?.role
      });

      res.status(500).json({
        error: 'Internal server error during authorization'
      });
    }
  };
};

// Password validation middleware
export const validatePassword = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const { password } = req.body;

    if (!password) {
      res.status(400).json({
        error: 'Password is required'
      });
      return;
    }

    // Check password length
    if (password.length < passwordPolicy.minLength) {
      res.status(400).json({
        error: `Password must be at least ${passwordPolicy.minLength} characters long`
      });
      return;
    }

    // Check for uppercase letter
    if (passwordPolicy.requireUppercase && !/[A-Z]/.test(password)) {
      res.status(400).json({
        error: 'Password must contain at least one uppercase letter'
      });
      return;
    }

    // Check for lowercase letter
    if (passwordPolicy.requireLowercase && !/[a-z]/.test(password)) {
      res.status(400).json({
        error: 'Password must contain at least one lowercase letter'
      });
      return;
    }

    // Check for number
    if (passwordPolicy.requireNumbers && !/[0-9]/.test(password)) {
      res.status(400).json({
        error: 'Password must contain at least one number'
      });
      return;
    }

    // Check for special character
    if (passwordPolicy.requireSpecialChars && !/[^A-Za-z0-9]/.test(password)) {
      res.status(400).json({
        error: 'Password must contain at least one special character'
      });
      return;
    }

    next();
  } catch (error) {
    // Log password validation errors
    logSecurityError(req, error as Error, {
      context: 'Password validation middleware'
    });

    res.status(500).json({
      error: 'Internal server error during password validation'
    });
  }
};

// Login attempt tracking middleware
export const trackLoginAttempts = (req: Request, res: Response, next: NextFunction): void => {
  try {
    // Log login attempt
    logLoginAttempt(req, false);

    // Continue with the request
    next();
  } catch (error) {
    // Log tracking errors
    logSecurityError(req, error as Error, {
      context: 'Login attempt tracking middleware'
    });

    // Continue with the request even if tracking fails
    next();
  }
}; 