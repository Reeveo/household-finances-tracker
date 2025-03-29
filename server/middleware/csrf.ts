import { Request, Response, NextFunction } from 'express';
import csrf from 'csurf';
import { csrfConfig } from '../config/security';
import { logSecurityError } from '../utils/securityLogger';

// Initialize CSRF protection
const csrfProtection = csrf(csrfConfig);

// CSRF protection middleware
export const csrfMiddleware = (req: any, res: Response, next: NextFunction): void => {
  try {
    csrfProtection(req, res, next);
  } catch (error) {
    // Log CSRF errors
    logSecurityError(req, error as Error, {
      context: 'CSRF middleware'
    });

    // Send error response
    res.status(403).json({
      error: 'Invalid CSRF token'
    });
  }
};

// CSRF token provider middleware
export const csrfTokenProvider = (req: any, res: Response, next: NextFunction): void => {
  try {
    // Generate CSRF token
    const token = req.csrfToken();

    // Set token in response header
    res.setHeader('X-CSRF-Token', token);

    // Set token in response cookie
    res.cookie('XSRF-TOKEN', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });

    next();
  } catch (error) {
    // Log CSRF token generation errors
    logSecurityError(req, error as Error, {
      context: 'CSRF token provider middleware'
    });

    // Continue with the request even if token generation fails
    next();
  }
};

// CSRF error handler middleware
export const csrfErrorHandler = (
  err: any,
  req: any,
  res: Response,
  next: NextFunction
): void => {
  try {
    // Check if error is CSRF token error
    if ('code' in err && err.code === 'EBADCSRFTOKEN') {
      // Log CSRF token validation errors
      logSecurityError(req, err, {
        context: 'CSRF token validation'
      });

      // Send error response
      res.status(403).json({
        error: 'Invalid CSRF token',
        message: 'The form submission has expired. Please try again.'
      });
      return;
    }

    // Pass other errors to the next error handler
    next(err);
  } catch (error) {
    // Log CSRF error handler errors
    logSecurityError(req, error as Error, {
      context: 'CSRF error handler middleware'
    });

    // Pass the error to the next error handler
    next(error);
  }
};

// CSRF token validation middleware
export const validateCsrfToken = (req: any, res: Response, next: NextFunction): void => {
  try {
    // Get token from header or cookie
    const token = req.headers['x-csrf-token'] || req.cookies['XSRF-TOKEN'];

    // Check if token exists
    if (!token) {
      throw new Error('CSRF token is missing');
    }

    // Validate token
    if (!req.csrfToken || token !== req.csrfToken()) {
      throw new Error('Invalid CSRF token');
    }

    next();
  } catch (error) {
    // Log CSRF token validation errors
    logSecurityError(req, error as Error, {
      context: 'CSRF token validation'
    });

    // Send error response
    res.status(403).json({
      error: 'Invalid CSRF token',
      message: 'The form submission has expired. Please try again.'
    });
  }
}; 