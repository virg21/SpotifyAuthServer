import express from 'express';
import { login, callback, refreshToken, register } from '../controllers/authController';
import { getAuthLimiter, getStandardLimiter } from '../middleware/rateLimiter';

const router = express.Router();

/**
 * @route   GET /api/auth/login
 * @desc    Redirects to Spotify login page
 * @access  Public
 */
router.get('/login', getStandardLimiter(), login);

/**
 * @route   GET /api/auth/callback
 * @desc    Callback from Spotify after authorization
 * @access  Public
 */
router.get('/callback', callback);

/**
 * @route   POST /api/auth/refresh
 * @desc    Refresh access token using refresh token
 * @access  Public
 */
router.post('/refresh', getStandardLimiter(), refreshToken);

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post('/register', getAuthLimiter(), register);

export default router;
