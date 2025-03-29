import { Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';
import { logSecurityError } from '../utils/securityLogger';

// Common validation rules
export const commonValidations = {
  id: body('id').isUUID().withMessage('Invalid ID format'),
  email: body('email').isEmail().normalizeEmail().withMessage('Invalid email format'),
  password: body('password')
    .isLength({ min: 12 })
    .withMessage('Password must be at least 12 characters long')
    .matches(/[A-Z]/)
    .withMessage('Password must contain at least one uppercase letter')
    .matches(/[a-z]/)
    .withMessage('Password must contain at least one lowercase letter')
    .matches(/[0-9]/)
    .withMessage('Password must contain at least one number')
    .matches(/[^A-Za-z0-9]/)
    .withMessage('Password must contain at least one special character'),
  amount: body('amount')
    .isFloat({ min: 0 })
    .withMessage('Amount must be a positive number'),
  date: body('date')
    .isISO8601()
    .withMessage('Invalid date format'),
  category: body('category')
    .isString()
    .trim()
    .notEmpty()
    .withMessage('Category is required'),
  description: body('description')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description must be less than 500 characters'),
  page: body('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  limit: body('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  search: body('search')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Search term must be less than 100 characters')
};

// Validation middleware factory
export const validateRequest = (validations: ReturnType<typeof body>[]) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Run all validations
      await Promise.all(validations.map(validation => validation.run(req)));

      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        // Log validation errors
        logSecurityError(req, new Error('Validation failed'), {
          errors: errors.array()
        });

        res.status(400).json({
          error: 'Validation failed',
          details: errors.array()
        });
        return;
      }

      next();
    } catch (error) {
      // Log unexpected errors
      logSecurityError(req, error as Error, {
        context: 'Request validation'
      });

      res.status(500).json({
        error: 'Internal server error during validation'
      });
    }
  };
};

// Example validation schemas
export const validationSchemas = {
  // User registration
  registerUser: [
    commonValidations.email,
    commonValidations.password,
    body('name')
      .isString()
      .trim()
      .notEmpty()
      .withMessage('Name is required')
      .isLength({ max: 100 })
      .withMessage('Name must be less than 100 characters')
  ],

  // User login
  loginUser: [
    commonValidations.email,
    body('password')
      .notEmpty()
      .withMessage('Password is required')
  ],

  // Create transaction
  createTransaction: [
    commonValidations.amount,
    commonValidations.date,
    commonValidations.category,
    commonValidations.description,
    body('type')
      .isIn(['income', 'expense'])
      .withMessage('Type must be either income or expense'),
    body('accountId')
      .isUUID()
      .withMessage('Invalid account ID')
  ],

  // Update transaction
  updateTransaction: [
    commonValidations.id,
    commonValidations.amount.optional(),
    commonValidations.date.optional(),
    commonValidations.category.optional(),
    commonValidations.description.optional(),
    body('type')
      .optional()
      .isIn(['income', 'expense'])
      .withMessage('Type must be either income or expense')
  ],

  // Search transactions
  searchTransactions: [
    commonValidations.page,
    commonValidations.limit,
    commonValidations.search,
    body('startDate')
      .optional()
      .isISO8601()
      .withMessage('Invalid start date format'),
    body('endDate')
      .optional()
      .isISO8601()
      .withMessage('Invalid end date format'),
    body('category')
      .optional()
      .isString()
      .trim()
      .notEmpty()
      .withMessage('Category cannot be empty'),
    body('type')
      .optional()
      .isIn(['income', 'expense'])
      .withMessage('Type must be either income or expense')
  ],

  // Update user profile
  updateProfile: [
    body('name')
      .optional()
      .isString()
      .trim()
      .notEmpty()
      .withMessage('Name cannot be empty')
      .isLength({ max: 100 })
      .withMessage('Name must be less than 100 characters'),
    body('currentPassword')
      .optional()
      .notEmpty()
      .withMessage('Current password is required'),
    commonValidations.password.optional()
  ],

  // Change password
  changePassword: [
    body('currentPassword')
      .notEmpty()
      .withMessage('Current password is required'),
    commonValidations.password
  ]
}; 