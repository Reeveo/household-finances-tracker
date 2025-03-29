import express, { Request, Response, NextFunction, RequestHandler } from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import csrf, { CsrfRequest } from 'csurf';
import compression from 'compression';
import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss-clean';
import hpp from 'hpp';
import { body, validationResult } from 'express-validator';
import { 
  helmetConfig, 
  rateLimitConfig, 
  csrfConfig,
  staticFileHeaders,
  corsConfig
} from '../config/security';
import { logSecurityError } from '../utils/securityLogger';

// Initialize CSRF protection
const csrfProtection = csrf(csrfConfig);

// Rate limiting configuration
const limiter = rateLimit(rateLimitConfig);

// Global validation middleware
const globalValidationMiddleware: RequestHandler = (req: Request, res: Response, next: NextFunction): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }
  next();
};

// Security middleware setup
export const setupSecurityMiddleware = (app: express.Application) => {
  // Basic security headers
  app.use(helmet(helmetConfig));

  // Rate limiting
  app.use('/api/', limiter);

  // CSRF protection
  app.use((req: CsrfRequest, res: Response, next: NextFunction) => {
    csrfProtection(req, res, next);
  });

  // Data sanitization against NoSQL query injection
  app.use(mongoSanitize());

  // Data sanitization against XSS
  app.use(xss());

  // Prevent parameter pollution
  app.use(hpp({
    whitelist: [
      'amount',
      'date',
      'category',
      'type',
      'page',
      'limit'
    ]
  }));

  // Compression
  app.use(compression());

  // Global validation middleware
  app.use(globalValidationMiddleware);
};

// Request validation middleware
export const validateRequest = (validations: any[]): RequestHandler => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    await Promise.all(validations.map(validation => validation.run(req)));

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    next();
  };
};

// Example validation rules
export const transactionValidation = [
  body('amount').isNumeric().withMessage('Amount must be a number'),
  body('date').isISO8601().withMessage('Invalid date format'),
  body('category').isString().trim().notEmpty().withMessage('Category is required'),
  body('type').isIn(['income', 'expense']).withMessage('Type must be either income or expense'),
  body('description').optional().isString().trim(),
  body('accountId').isUUID().withMessage('Invalid account ID')
];

// Error handling middleware
export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (err instanceof Error) {
    // CSRF token errors
    if ('code' in err && err.code === 'EBADCSRFTOKEN') {
      res.status(403).json({
        error: 'Invalid CSRF token'
      });
      return;
    }

    // Validation errors
    if (err.name === 'ValidationError') {
      res.status(400).json({
        error: err.message
      });
      return;
    }

    // Rate limit errors
    if (err.name === 'RateLimitExceeded') {
      res.status(429).json({
        error: 'Too many requests, please try again later'
      });
      return;
    }
  }

  // Default error
  console.error(err);
  res.status(500).json({
    error: 'Internal server error'
  });
}; 