import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import { rateLimitConfig, apiRateLimits } from '../config/security';
import { logSecurityError } from '../utils/securityLogger';

// Create a limiter instance
const limiter = rateLimit(rateLimitConfig);

// Create API rate limiters based on subscription tier
const apiLimiters = {
  free: rateLimit(apiRateLimits.free),
  premium: rateLimit(apiRateLimits.premium),
  enterprise: rateLimit(apiRateLimits.enterprise)
};

// Rate limiter middleware
export const rateLimiterMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  try {
    limiter(req, res, next);
  } catch (error) {
    // Log rate limit errors
    logSecurityError(req, error as Error, {
      context: 'Rate limiter middleware'
    });

    // Continue with the request even if rate limiting fails
    next();
  }
};

// API rate limiter middleware factory
export const createApiRateLimiter = (tier: 'free' | 'premium' | 'enterprise') => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      apiLimiters[tier](req, res, next);
    } catch (error) {
      // Log API rate limit errors
      logSecurityError(req, error as Error, {
        context: 'API rate limiter middleware',
        tier
      });

      // Continue with the request even if rate limiting fails
      next();
    }
  };
};

// Login rate limiter (stricter limits for login attempts)
export const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  message: 'Too many login attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  keyGenerator: (req: Request) => {
    return req.ip || req.socket.remoteAddress || 'unknown';
  }
});

// Password reset rate limiter
export const passwordResetRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 attempts per hour
  message: 'Too many password reset attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  keyGenerator: (req: Request) => {
    return req.ip || req.socket.remoteAddress || 'unknown';
  }
});

// Registration rate limiter
export const registrationRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 attempts per hour
  message: 'Too many registration attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  keyGenerator: (req: Request) => {
    return req.ip || req.socket.remoteAddress || 'unknown';
  }
}); 