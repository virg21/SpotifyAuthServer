import express from 'express';
import * as spotify from '../utils/spotify.js';

const router = express.Router();

/**
 * Route to redirect user to Spotify's authorization page
 * @route GET /api/login
 */
router.get('/login', (req, res) => {
  try {
    console.log('Redirecting to Spotify login...');
    const authUrl = spotify.getAuthUrl();
    console.log('Auth URL:', authUrl);
    res.redirect(authUrl);
  } catch (error) {
    console.error('Error initiating Spotify login:', error);
    res.status(500).json({ error: 'Failed to initiate Spotify login' });
  }
});

/**
 * Route that receives the callback from Spotify after authorization
 * @route GET /api/auth/callback
 */
router.get('/auth/callback', async (req, res) => {
  try {
    const { code } = req.query;
    
    if (!code) {
      return res.status(400).json({ error: 'Authorization code is required' });
    }
    
    console.log('Received authorization code from Spotify');
    console.log('Callback URL (actual):', req.protocol + '://' + req.get('host') + req.originalUrl);
    
    // Exchange code for tokens
    const tokens = await spotify.exchangeCodeForTokens(code);
    console.log('Received tokens from Spotify');
    
    // Typically, at this point, you'd:
    // 1. Store tokens in a database associated with the user
    // 2. Set up a session or JWT for the user
    
    // For this simple example, we'll just pass the tokens to the frontend
    // In a real app, NEVER expose tokens directly to the frontend
    res.redirect(`/success?access_token=${tokens.access_token}`);
  } catch (error) {
    console.error('Error handling Spotify callback:', error);
    res.status(500).json({ 
      error: 'Failed to complete Spotify authentication',
      details: error.message
    });
  }
});

/**
 * Route to get user profile after successful authentication
 * @route GET /api/spotify/profile
 */
router.get('/profile', async (req, res) => {
  try {
    const { access_token } = req.query;
    
    if (!access_token) {
      return res.status(401).json({ error: 'Access token is required' });
    }
    
    // Get user profile from Spotify
    const profile = await spotify.getUserProfile(access_token);
    res.json(profile);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

export default router;