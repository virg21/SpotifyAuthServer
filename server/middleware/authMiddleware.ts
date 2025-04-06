import { Request, Response, NextFunction } from 'express';
import { storage } from '../storage';
import session from 'express-session';

// Extend the session type
declare module 'express-session' {
  interface SessionData {
    userId: number;
  }
}

// Extended Express Request with user property
export interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    [key: string]: any;
  };
}

/**
 * Middleware to check if user is authenticated
 * User must be logged in to access the route
 */
export const requireAuth = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  // Check if user is logged in (session-based authentication)
  if (req.session && req.session.userId) {
    try {
      // Get user from database
      const user = await storage.getUser(req.session.userId);
      
      if (user) {
        // Set user object in request for downstream middleware/handlers
        req.user = user;
        return next();
      }
    } catch (error) {
      console.error('Error in auth middleware:', error);
    }
  }

  // User is not authenticated
  return res.status(401).json({
    message: 'Authentication required',
    redirectTo: '/connect-spotify' // Redirect to login page
  });
};

/**
 * Middleware to pass user data if authenticated, but not requiring authentication
 */
export const optionalAuth = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (req.session && req.session.userId) {
    try {
      const user = await storage.getUser(req.session.userId);
      if (user) {
        req.user = user;
      }
    } catch (error) {
      console.error('Error in optional auth middleware:', error);
    }
  }
  next();
};