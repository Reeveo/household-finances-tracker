import { Request, Response, NextFunction } from 'express';
import { pool } from './db';

/**
 * Middleware to map a Supabase auth user to our internal user record
 * This middleware assumes that req.user.id contains the Supabase Auth UUID
 */
export async function mapAuthUser(req: Request, res: Response, next: NextFunction) {
  try {
    // If no authenticated user, continue without mapping
    if (!req.user || !req.user.id) {
      return next();
    }

    const authId = req.user.id;
    
    // Look up mapping between auth_id and user_id
    const result = await pool.query(
      'SELECT user_id FROM auth_mapping WHERE auth_id = $1',
      [authId]
    );
    
    if (result.rows.length === 0) {
      // No mapping found - this might be a new user created directly in Supabase
      // Option 1: Reject the request
      // return res.status(403).json({ error: 'User not found in system' });
      
      // Option 2: Automatically create a user record (if this is your migration strategy)
      const userResult = await pool.query(
        'SELECT * FROM users WHERE email = $1',
        [req.user.email]
      );
      
      if (userResult.rows.length > 0) {
        // User exists with this email, create mapping
        const userId = userResult.rows[0].id;
        await pool.query(
          'INSERT INTO auth_mapping (auth_id, user_id) VALUES ($1, $2)',
          [authId, userId]
        );
        req.userId = userId;
      } else {
        // Create a new user and mapping
        const newUserResult = await pool.query(
          'INSERT INTO users (username, email, created_at) VALUES ($1, $2, NOW()) RETURNING id',
          [req.user.email?.split('@')[0] || 'user_' + Math.random().toString(36).substring(2, 10), 
           req.user.email]
        );
        
        const newUserId = newUserResult.rows[0].id;
        
        await pool.query(
          'INSERT INTO auth_mapping (auth_id, user_id) VALUES ($1, $2)',
          [authId, newUserId]
        );
        
        req.userId = newUserId;
      }
    } else {
      // Mapping found, set the user ID on the request
      req.userId = result.rows[0].user_id;
    }
    
    next();
  } catch (error) {
    console.error('Error in auth mapping middleware:', error);
    res.status(500).json({ error: 'Internal server error during authentication mapping' });
  }
}

// Augment the Express Request interface
declare global {
  namespace Express {
    interface Request {
      userId?: number;
    }
  }
} 