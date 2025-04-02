import { createClient } from '@supabase/supabase-js';
import { Request, Response, NextFunction } from 'express';
import { storage } from './storage';

// More detailed debug logging
console.log("--- Reading Supabase Environment Variables ---");
const supabaseUrl = process.env.SUPABASE_URL || 'http://127.0.0.1:54321'; // Use SUPABASE_URL (no VITE_)
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const anonKey = process.env.SUPABASE_ANON_KEY || ''; // Also read anon key, often needed
console.log(`SUPABASE_URL read as: ${supabaseUrl}`);
console.log(`SUPABASE_SERVICE_ROLE_KEY read as: ${serviceRoleKey ? 'SET (length: ' + serviceRoleKey.length + ')' : 'NOT SET or empty'}`);
console.log(`SUPABASE_ANON_KEY read as: ${anonKey ? 'SET (length: ' + anonKey.length + ')' : 'NOT SET or empty'}`);
console.log("--- Finished Reading Supabase Environment Variables ---");


// Initialize Supabase client with admin privileges (service role)
const supabaseAdmin = createClient(
  supabaseUrl,
  serviceRoleKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    }
  }
);

// Middleware to verify JWT token from Supabase
export const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return res.status(401).json({ message: "Authentication required" });
  }
  
  const token = authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: "Invalid token format" });
  }
  
  try {
    // Verify the JWT token with Supabase
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
    
    if (error || !user) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }
    
    // Get the user from our database using the auth mapping
    const authMapping = await storage.getAuthMappingByAuthId(user.id);
    
    if (!authMapping) {
      return res.status(401).json({ message: "User profile not found" });
    }
    
    const appUser = await storage.getUser(authMapping.userId);
    
    if (!appUser) {
      return res.status(401).json({ message: "User not found" });
    }
    
    // Set the user on the request object
    req.user = appUser;
    
    // Add auth info to the request
    req.auth = {
      token,
      supabaseUser: user,
      userId: appUser.id,
    };
    
    next();
  } catch (error) {
    console.error('Error verifying auth token:', error);
    return res.status(401).json({ message: "Authentication failed" });
  }
};

// Type-safe getUserById helper
export async function getUserById(userId: number) {
  return await storage.getUser(userId);
}

// Function to create a user profile in our database
export async function createUserProfile(authId: string, userData: any) {
  try {
    // Create user in our database
    const user = await storage.createUser(userData);
    
    // Create mapping between Supabase Auth user and our user
    await storage.createAuthMapping({
      authId,
      userId: user.id,
    });
    
    return user;
  } catch (error) {
    console.error('Error creating user profile:', error);
    throw error;
  }
}

// Declare for TypeScript
declare global {
  namespace Express {
    interface Request {
      auth?: {
        token: string;
        supabaseUser: any;
        userId: number;
      };
    }
  }
} 