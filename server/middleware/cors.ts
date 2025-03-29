import { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { allowedOrigins, staticFileHeaders, corsConfig } from '../config/security';
import { logSecurityError } from '../utils/securityLogger';

// CORS middleware
export const corsMiddleware = cors(corsConfig);

// Security headers middleware
export const securityHeadersMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  try {
    // Add security headers to all responses
    Object.entries(staticFileHeaders).forEach(([key, value]) => {
      res.setHeader(key, value);
    });

    // Add HSTS header in production
    if (process.env.NODE_ENV === 'production') {
      res.setHeader(
        'Strict-Transport-Security',
        'max-age=31536000; includeSubDomains; preload'
      );
    }

    next();
  } catch (error) {
    // Log security header errors
    logSecurityError(req, error as Error, {
      context: 'Security headers middleware'
    });

    // Continue with the request even if header setting fails
    next();
  }
};

// Preflight request handler
export const preflightHandler = (req: Request, res: Response): void => {
  try {
    // Set CORS headers for preflight requests
    const origin = req.headers.origin;
    if (origin && allowedOrigins.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Access-Control-Allow-Methods', corsConfig.methods.join(', '));
      res.setHeader('Access-Control-Allow-Headers', corsConfig.allowedHeaders.join(', '));
      res.setHeader('Access-Control-Allow-Credentials', corsConfig.credentials.toString());
      res.setHeader('Access-Control-Max-Age', corsConfig.maxAge.toString());
    }

    res.status(204).end();
  } catch (error) {
    // Log preflight request errors
    logSecurityError(req, error as Error, {
      context: 'Preflight request handler'
    });

    res.status(500).json({
      error: 'Internal server error during preflight request'
    });
  }
}; 