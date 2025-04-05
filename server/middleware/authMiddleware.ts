import { Request, Response, NextFunction } from 'express';

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
export const requireAuth = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  // Check if user is logged in (session-based authentication)
  if (req.session && req.session.user) {
    // Set user object in request for downstream middleware/handlers
    req.user = req.session.user;
    return next();
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
export const optionalAuth = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (req.session && req.session.user) {
    req.user = req.session.user;
  }
  next();
};