import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { setupSecurityMiddleware } from './middleware/security';
import { corsMiddleware, securityHeadersMiddleware } from './middleware/cors';
import { rateLimiterMiddleware } from './middleware/rateLimiter';
import { csrfMiddleware, csrfTokenProvider } from './middleware/csrf';
import { errorHandler } from './middleware/security';

const app = express();
const port = 3008;

// Basic middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser()); // Required for CSRF

// CORS must be first
app.use(corsMiddleware);
app.use(securityHeadersMiddleware);

// Rate limiting
app.use('/api', rateLimiterMiddleware);

// Public routes that don't require CSRF
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to the Household Finances Tracker API',
    endpoints: {
      health: '/api/health',
      test: '/api/test (requires CSRF token)'
    }
  });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', message: 'API is working!' });
});

// Apply CSRF protection after the routes that don't need it
app.use(csrfMiddleware);
app.use(csrfTokenProvider);

// Protected routes (require CSRF)
app.get('/api/test', (req, res) => {
  res.json({ message: 'Protected API route is working!' });
});

// Error handling must be last
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  console.log(`Test the API at http://localhost:${port}/api/health`);
}); 