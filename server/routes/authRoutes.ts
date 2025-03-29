import express from 'express';
import { login, callback, refreshToken } from '../controllers/authController';

const router = express.Router();

/**
 * @route   GET /api/auth/login
 * @desc    Redirects to Spotify login page
 * @access  Public
 */
router.get('/login', login);

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
router.post('/refresh', refreshToken);

export default router;
