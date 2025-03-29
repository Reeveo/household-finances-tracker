import { Request, Response, NextFunction } from 'express';
import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss-clean';
import hpp from 'hpp';
import { logSecurityError } from '../utils/securityLogger';

// NoSQL injection protection middleware
export const noSqlInjectionProtection = (req: Request, res: Response, next: NextFunction): void => {
  try {
    mongoSanitize()(req, res, next);
  } catch (error) {
    // Log NoSQL injection protection errors
    logSecurityError(req, error as Error, {
      context: 'NoSQL injection protection middleware'
    });

    // Continue with the request even if sanitization fails
    next();
  }
};

// XSS protection middleware
export const xssProtection = (req: Request, res: Response, next: NextFunction): void => {
  try {
    xss()(req, res, next);
  } catch (error) {
    // Log XSS protection errors
    logSecurityError(req, error as Error, {
      context: 'XSS protection middleware'
    });

    // Continue with the request even if sanitization fails
    next();
  }
};

// Parameter pollution protection middleware
export const parameterPollutionProtection = (req: Request, res: Response, next: NextFunction): void => {
  try {
    hpp({
      whitelist: [
        'amount',
        'date',
        'category',
        'type',
        'page',
        'limit',
        'search',
        'startDate',
        'endDate'
      ]
    })(req, res, next);
  } catch (error) {
    // Log parameter pollution protection errors
    logSecurityError(req, error as Error, {
      context: 'Parameter pollution protection middleware'
    });

    // Continue with the request even if protection fails
    next();
  }
};

// Request body sanitization middleware
export const sanitizeRequestBody = (req: Request, res: Response, next: NextFunction): void => {
  try {
    // Sanitize string values in request body
    if (req.body) {
      Object.keys(req.body).forEach(key => {
        if (typeof req.body[key] === 'string') {
          req.body[key] = req.body[key].trim();
        }
      });
    }

    // Sanitize string values in query parameters
    if (req.query) {
      Object.keys(req.query).forEach(key => {
        if (typeof req.query[key] === 'string') {
          req.query[key] = req.query[key].trim();
        }
      });
    }

    next();
  } catch (error) {
    // Log request body sanitization errors
    logSecurityError(req, error as Error, {
      context: 'Request body sanitization middleware'
    });

    // Continue with the request even if sanitization fails
    next();
  }
};

// Combined sanitization middleware
export const sanitizationMiddleware = [
  noSqlInjectionProtection,
  xssProtection,
  parameterPollutionProtection,
  sanitizeRequestBody
]; 