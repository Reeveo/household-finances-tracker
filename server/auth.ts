import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express, Request, Response, NextFunction } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User as SelectUser } from "@shared/schema";
import { createClient } from '@supabase/supabase-js';
import { mapAuthUser } from './auth-mapping';

// Define different types of users to handle the dual auth system
type DatabaseUser = {
  id: number;
  username: string;
  password: string;
  name: string | null;
  email: string | null;
  createdAt: Date | null;
};

type SupabaseUser = {
  id: string; // Supabase UUID
  email?: string;
  aud?: string;
  role?: string;
};

declare global {
  namespace Express {
    // Update the User interface to include all possible properties
    interface User {
      // Database user properties
      id: string | number; // Can be either Supabase UUID (string) or Database ID (number)
      username?: string;
      password?: string;
      name?: string | null;
      email?: string | null;
      createdAt?: Date | null;
      
      // Supabase specific properties
      aud?: string;
      role?: string;
    }
  }
}

const scryptAsync = promisify(scrypt);

// Initialize Supabase client
const supabase = createClient(
  process.env.VITE_SUPABASE_URL || 'http://127.0.0.1:54321',
  process.env.VITE_SUPABASE_ANON_KEY || ''
);

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

export async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

/**
 * Middleware that verifies a JWT token from Supabase
 */
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const token = authHeader.split(' ')[1];
  
  // Verify the token with Supabase
  supabase.auth.getUser(token)
    .then(({ data, error }) => {
      if (error || !data.user) {
        return res.status(401).json({ error: 'Invalid authentication token' });
      }
      
      // Set the authenticated user on the request
      req.user = data.user as Express.User;
      next();
    })
    .catch(error => {
      console.error('Error verifying authentication token:', error);
      res.status(500).json({ error: 'Error processing authentication' });
    });
}

export function setupAuth(app: Express) {
  // Maintain session auth for backward compatibility during migration
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || "personal-finance-tracker-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  // Map Supabase Auth users to our database users
  app.use(mapAuthUser);

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      const user = await storage.getUserByUsername(username);
      if (!user || !(await comparePasswords(password, user.password))) {
        return done(null, false);
      } else {
        // DEBUG: Log the user object before passing to done
        console.log("User object passed to done in LocalStrategy:", JSON.stringify(user, null, 2));
        return done(null, user as Express.User);
      }
    }),
  );

  passport.serializeUser((user: Express.User, done) => {
    // Handle both types of IDs
    done(null, user.id);
  });
  
  passport.deserializeUser(async (id: string | number, done) => {
    try {
      // If id is a number, it's a database user
      if (typeof id === 'number') {
        const user = await storage.getUser(id);
        done(null, user as Express.User);
      } else {
        // If id is a string, try to map it from Supabase Auth
        // This might need additional logic depending on your setup
        done(null, { id } as Express.User);
      }
    } catch (error) {
      done(error, null);
    }
  });

  // Legacy registration endpoint - for backward compatibility
  app.post("/api/register", async (req, res, next) => {
    const existingUser = await storage.getUserByUsername(req.body.username);
    if (existingUser) {
      return res.status(400).send("Username already exists");
    }

    const user = await storage.createUser({
      ...req.body,
      password: await hashPassword(req.body.password),
    });

    // Don't return the hashed password to the client
    const { password, ...userWithoutPassword } = user;

    req.login(user as Express.User, (err) => {
      if (err) return next(err);
      res.status(201).json(userWithoutPassword);
    });
  });

  // Legacy login endpoint - for backward compatibility
  app.post("/api/login", passport.authenticate("local"), (req, res) => {
    // Don't return the hashed password to the client
    const user = req.user as DatabaseUser;
    const { password, ...userWithoutPassword } = user;
    res.status(200).json(userWithoutPassword);
  });

  // Legacy logout endpoint - for backward compatibility
  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  // Access current user info - compatible with both auth methods
  app.get("/api/user", (req, res) => {
    if (req.userId) {
      // User authenticated via Supabase
      storage.getUser(req.userId)
        .then(user => {
          if (!user) {
            return res.status(404).json({ error: 'User not found' });
          }
          const { password, ...userWithoutPassword } = user;
          res.json(userWithoutPassword);
        })
        .catch(error => {
          console.error('Error fetching user:', error);
          res.status(500).json({ error: 'Error fetching user data' });
        });
    } else if (req.isAuthenticated()) {
      // User authenticated via session
      const user = req.user as DatabaseUser;
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } else {
      res.status(401).json({ error: 'Authentication required' });
    }
  });
}
