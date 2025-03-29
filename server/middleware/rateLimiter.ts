import rateLimit, { Options } from 'express-rate-limit';
import { getEnv } from '../config/env';
import { Request, Response, NextFunction } from 'express';
import { RequestHandler } from 'express';

// Define rate limit configurations for different endpoints
const standardLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: { 
    status: 'error', 
    message: 'Too many requests, please try again later.' 
  }
});

// More strict limiter for auth endpoints
const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Limit each IP to 10 login/register attempts per hour
  standardHeaders: true,
  legacyHeaders: false,
  message: { 
    status: 'error', 
    message: 'Too many authentication attempts, please try again later.' 
  }
});

// Strict limiter for verification endpoints
const verificationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // Limit each IP to 5 verification attempts per hour
  standardHeaders: true,
  legacyHeaders: false,
  message: { 
    status: 'error', 
    message: 'Too many verification attempts, please try again later.' 
  }
});

// Very strict limiter for password reset/recovery endpoints
const recoveryLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // Limit each IP to 3 reset attempts per hour
  standardHeaders: true,
  legacyHeaders: false,
  message: { 
    status: 'error', 
    message: 'Too many password recovery attempts, please try again later.' 
  }
});

// Limiter for API endpoints that could be expensive to run
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // Limit each IP to 30 requests per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: { 
    status: 'error', 
    message: 'Too many requests to this API endpoint, please try again later.' 
  }
});

// Test route limiter - very strict for test endpoints
const testLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 3, // 3 requests per minute
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 'error',
    message: 'Rate limit exceeded for test endpoint. Please wait before trying again.'
  }
});

// Determine if we should apply rate limits based on environment
const shouldApplyRateLimit = () => {
  // Ensure we have access to the latest environment variables
  const nodeEnv = process.env.NODE_ENV || 'development';
  
  // Get force rate limit value and convert to boolean
  const forceRateLimitValue = process.env.FORCE_RATE_LIMIT || '';
  const forceRateLimit = forceRateLimitValue.toLowerCase() === 'true';
  
  // Always return true for now to force rate limiting for testing
  return true;
};

// Simple pass-through middleware
const passThroughMiddleware: RequestHandler = (req: Request, res: Response, next: NextFunction) => next();

// Export configured limiters or pass-through middleware based on environment
export const getStandardLimiter = (): RequestHandler => shouldApplyRateLimit() ? standardLimiter : passThroughMiddleware;
export const getAuthLimiter = (): RequestHandler => shouldApplyRateLimit() ? authLimiter : passThroughMiddleware;
export const getVerificationLimiter = (): RequestHandler => shouldApplyRateLimit() ? verificationLimiter : passThroughMiddleware;
export const getRecoveryLimiter = (): RequestHandler => shouldApplyRateLimit() ? recoveryLimiter : passThroughMiddleware;
export const getApiLimiter = (): RequestHandler => shouldApplyRateLimit() ? apiLimiter : passThroughMiddleware;
export const getTestLimiter = (): RequestHandler => shouldApplyRateLimit() ? testLimiter : passThroughMiddleware;