import { Request, Response } from 'express';
import { storage } from '../storage';
import { insertUserSchema } from '@shared/schema';
import * as spotifyApi from '../utils/spotifyApi';
import { sendVerificationCode } from './verificationController';
import { twilioClient } from '../utils/twilioClient';
import { z } from 'zod';
import axios from 'axios';

/**
 * Initiates the Spotify authorization flow
 * Redirects to Spotify's authorization page
 * @route GET /api/auth/spotify/login
 */
export const initiateSpotifyLogin = (req: Request, res: Response) => {
  try {
    // Get userId from session if available
    const userId = req.session.userId;
    
    // Generate state parameter to include the userId for connecting accounts later
    const state = userId ? JSON.stringify({ userId }) : JSON.stringify({ userId: 0 });
    
    // Get authorization URL from Spotify API utils
    const authUrl = spotifyApi.getAuthorizationUrl(state);
    console.log('Redirecting to Spotify authorization URL');
    
    // Redirect to Spotify authorization page
    res.redirect(authUrl);
  } catch (error) {
    console.error('Error initiating Spotify login:', error);
    res.status(500).json({ error: 'Failed to initiate Spotify login' });
  }
};

/**
 * Handles the callback from Spotify authorization
 * Exchanges authorization code for access and refresh tokens
 * Creates or updates user with Spotify data
 * @route GET /api/auth/spotify/callback
 */
export const handleSpotifyCallback = async (req: Request, res: Response) => {
  try {
    console.log('Spotify callback received with query:', {
      code: req.query.code ? 'PRESENT' : 'MISSING',
      state: req.query.state,
      error: req.query.error
    });
    
    const { code, state, error } = req.query;
    
    // Check for errors from Spotify
    if (error) {
      console.error('Spotify returned an error:', error);
      return res.send(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Spotify Authentication Error</title>
            <script>
              // Redirect to the connect-spotify page on the client side with error message
              window.location.href = "/connect-spotify?error=${encodeURIComponent(error as string)}";
            </script>
          </head>
          <body>
            <p>Authentication failed: ${error}. Redirecting...</p>
          </body>
        </html>
      `);
    }
    
    if (!code) {
      return res.send(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Spotify Authentication Error</title>
            <script>
              // Redirect to the connect-spotify page on the client side with error message
              window.location.href = "/connect-spotify?error=Authorization%20code%20is%20required";
            </script>
          </head>
          <body>
            <p>Authentication failed: Authorization code is required. Redirecting...</p>
          </body>
        </html>
      `);
    }
    
    console.log('Processing Spotify callback with code');
    
    // Exchange authorization code for tokens
    let tokenResponse;
    try {
      tokenResponse = await spotifyApi.exchangeCodeForTokens(code as string);
      console.log('Token exchange successful, received access token');
    } catch (tokenError: any) {
      console.error('Failed to exchange code for tokens:', tokenError.message);
      return res.send(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Spotify Authentication Error</title>
            <script>
              // Redirect to the connect-spotify page on the client side with error message
              window.location.href = "/connect-spotify?error=${encodeURIComponent('Failed to exchange code for tokens: ' + tokenError.message)}";
            </script>
          </head>
          <body>
            <p>Authentication failed: ${tokenError.message}. Redirecting...</p>
          </body>
        </html>
      `);
    }
    
    const { access_token, refresh_token, expires_in } = tokenResponse;
    
    // Get user profile from Spotify
    let spotifyProfile;
    try {
      spotifyProfile = await spotifyApi.getUserProfile(access_token);
      console.log('Retrieved Spotify profile for user:', spotifyProfile.id);
    } catch (profileError: any) {
      console.error('Failed to get Spotify profile:', profileError.message);
      return res.send(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Spotify Authentication Error</title>
            <script>
              // Redirect to the connect-spotify page on the client side with error message
              window.location.href = "/connect-spotify?error=${encodeURIComponent('Failed to get Spotify profile: ' + profileError.message)}";
            </script>
          </head>
          <body>
            <p>Authentication failed: Failed to get Spotify profile: ${profileError.message}. Redirecting...</p>
          </body>
        </html>
      `);
    }
    
    // Check if user with this Spotify ID already exists
    let user = await storage.getUserBySpotifyId(spotifyProfile.id);
    
    // Calculate token expiration time
    const tokenExpiresAt = new Date();
    tokenExpiresAt.setSeconds(tokenExpiresAt.getSeconds() + expires_in);
    
    // Parse state if it exists to get the userId for account connection
    let existingUserId: number | undefined;
    if (state) {
      try {
        const stateData = JSON.parse(state as string);
        existingUserId = stateData.userId;
        console.log('Parsed state parameter, userId:', existingUserId);
      } catch (e) {
        console.error('Error parsing state parameter:', e);
      }
    }
    
    // Logic to create or update user
    try {
      if (existingUserId) {
        // Connect Spotify to existing account
        const existingUser = await storage.getUser(existingUserId);
        
        if (existingUser) {
          console.log('Updating existing user with Spotify data:', existingUserId);
          user = await storage.updateUser(existingUser.id, {
            spotifyId: spotifyProfile.id,
            spotifyAccessToken: access_token,
            spotifyRefreshToken: refresh_token,
            displayName: spotifyProfile.display_name || existingUser.displayName,
            email: spotifyProfile.email || existingUser.email,
          });
        } else {
          console.log('User ID from state not found:', existingUserId);
        }
      } else if (!user) {
        // Create new user with Spotify data
        console.log('Creating new user with Spotify data');
        user = await storage.createUser({
          username: `user_${Date.now()}`,
          password: '', // No password for Spotify users
          displayName: spotifyProfile.display_name || 'Spotify User',
          email: spotifyProfile.email || '',
          phone: '',
          spotifyId: spotifyProfile.id,
          spotifyAccessToken: access_token,
          spotifyRefreshToken: refresh_token,
          emailVerified: spotifyProfile.email ? true : false, // Trust Spotify's email verification
          phoneVerified: false,
          notificationsEnabled: true,
        });
      } else {
        // Update existing user with new Spotify tokens
        console.log('Updating existing Spotify user:', user.id);
        user = await storage.updateUser(user.id, {
          spotifyAccessToken: access_token,
          spotifyRefreshToken: refresh_token,
          displayName: spotifyProfile.display_name || user.displayName,
          email: spotifyProfile.email || user.email,
        });
      }
    } catch (userError: any) {
      console.error('Error creating/updating user:', userError);
      return res.send(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Spotify Authentication Error</title>
            <script>
              // Redirect to the connect-spotify page on the client side with error message
              window.location.href = "/connect-spotify?error=${encodeURIComponent('Failed to create or update user: ' + userError.message)}";
            </script>
          </head>
          <body>
            <p>Authentication failed: Failed to create or update user: ${userError.message}. Redirecting...</p>
          </body>
        </html>
      `);
    }
    
    // Set user session
    if (!user) {
      return res.send(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Spotify Authentication Error</title>
            <script>
              // Redirect to the connect-spotify page on the client side with error message
              window.location.href = "/connect-spotify?error=${encodeURIComponent('Failed to create or update user')}";
            </script>
          </head>
          <body>
            <p>Authentication failed: Failed to create or update user. Redirecting...</p>
          </body>
        </html>
      `);
    }
    
    req.session.userId = user.id;
    console.log('User session set, serving success page');
    
    // Instead of redirecting, send an HTML response that will automatically redirect
    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Spotify Authentication Successful</title>
          <script>
            // Redirect to the analyzing music page on the client side
            window.location.href = "/analyzing-music";
          </script>
        </head>
        <body>
          <p>Authentication successful! Redirecting...</p>
        </body>
      </html>
    `);
  } catch (error: any) {
    console.error('Error handling Spotify callback:', error);
    const errorDetail = error.message || 'Unknown error';
    return res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Spotify Authentication Error</title>
          <script>
            // Redirect to the connect-spotify page on the client side with error message
            window.location.href = "/connect-spotify?error=${encodeURIComponent('Failed to complete Spotify authentication: ' + errorDetail)}";
          </script>
        </head>
        <body>
          <p>Authentication failed: ${errorDetail}. Redirecting...</p>
        </body>
      </html>
    `);
  }
};

// POST callback route removed in favor of simpler GET approach

/**
 * Refreshes an expired Spotify access token
 * @route POST /api/auth/spotify/refresh
 */
export const refreshSpotifyToken = async (req: Request, res: Response) => {
  try {
    // Check if user is authenticated
    if (!req.session.userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    
    // Get current user
    const user = await storage.getUser(req.session.userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    if (!user.spotifyRefreshToken) {
      return res.status(400).json({ error: 'No refresh token available' });
    }
    
    // Refresh token
    const refreshResponse = await spotifyApi.refreshAccessToken(user.spotifyRefreshToken);
    const { access_token, expires_in } = refreshResponse;
    
    // Calculate new expiration time
    const tokenExpiresAt = new Date();
    tokenExpiresAt.setSeconds(tokenExpiresAt.getSeconds() + expires_in);
    
    // Update user with new token
    const updatedUser = await storage.updateUser(user.id, {
      spotifyAccessToken: access_token,
    });
    
    res.status(200).json({
      access_token,
      expires_at: tokenExpiresAt,
    });
  } catch (error) {
    console.error('Error refreshing Spotify token:', error);
    res.status(500).json({ error: 'Failed to refresh Spotify token' });
  }
};

/**
 * Logs out the user by clearing the session
 * @route POST /api/auth/logout
 */
export const logout = (req: Request, res: Response) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Error destroying session:', err);
      return res.status(500).json({ error: 'Failed to logout' });
    }
    
    res.status(200).json({ message: 'Logged out successfully' });
  });
};

/**
 * Returns the current authenticated user's data
 * @route GET /api/auth/me
 */
export const getCurrentUser = async (req: Request, res: Response) => {
  try {
    // Check if user is authenticated
    if (!req.session.userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    
    // Get current user
    const user = await storage.getUser(req.session.userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Remove sensitive fields
    const { password, spotifyAccessToken, spotifyRefreshToken, ...userWithoutSensitiveData } = user;
    
    res.status(200).json(userWithoutSensitiveData);
  } catch (error) {
    console.error('Error getting current user:', error);
    res.status(500).json({ error: 'Failed to get current user' });
  }
};

/**
 * Register a new user via phone verification
 * @route POST /api/auth/register
 */
export const register = async (req: Request, res: Response) => {
  try {
    // Validate request body
    const validationResult = insertUserSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({ 
        error: 'Invalid user data', 
        details: validationResult.error.format() 
      });
    }
    
    const userData = validationResult.data;
    
    // Check if user with this phone already exists
    const existingUserByPhone = userData.phone 
      ? await storage.getUserByPhone(userData.phone) 
      : null;
    
    if (existingUserByPhone) {
      return res.status(400).json({ error: 'Phone number already registered' });
    }
    
    // Check if user with this email already exists
    const existingUserByEmail = userData.email 
      ? await storage.getUserByEmail(userData.email) 
      : null;
    
    if (existingUserByEmail) {
      return res.status(400).json({ error: 'Email already registered' });
    }
    
    // Create user
    const user = await storage.createUser(userData);
    
    // Set session
    req.session.userId = user.id;
    
    let verificationSent = false;
    
    // Send verification code for phone
    if (userData.phone) {
      try {
        // Create a modified request object to avoid passing along res
        const modifiedReq = {
          ...req,
          params: { ...req.params, userId: user.id.toString() },
          body: { phone: userData.phone }
        };
        
        // Use the Twilio client directly instead of the API handler
        if (twilioClient.isConfigured()) {
          await twilioClient.sendVerificationCode(userData.phone);
        }
        
        verificationSent = true;
      } catch (verificationError) {
        console.error('Error sending verification code during registration:', verificationError);
        // We'll continue with registration even if verification fails
      }
    }
    
    // Remove sensitive data before sending response
    const { password, ...userWithoutPassword } = user;
    
    res.status(201).json({
      ...userWithoutPassword,
      verificationSent
    });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ error: 'Failed to register user' });
  }
};

/**
 * Login with username/phone and password
 * @route POST /api/auth/login
 */
export const login = async (req: Request, res: Response) => {
  try {
    const { username, phone, password } = req.body;
    
    if ((!username && !phone) || !password) {
      return res.status(400).json({ error: 'Username/phone and password are required' });
    }
    
    // Find user by username or phone
    let user;
    if (username) {
      user = await storage.getUserByUsername(username);
    } else if (phone) {
      user = await storage.getUserByPhone(phone);
    }
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Check password
    // In a real app, we'd use bcrypt or similar to compare hashed passwords
    if (user.password !== password) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Set session
    req.session.userId = user.id;
    
    // Remove sensitive data before sending response
    const { password: _, ...userWithoutPassword } = user;
    
    res.status(200).json(userWithoutPassword);
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ error: 'Failed to login' });
  }
};

/**
 * Test Spotify API connectivity - FOR TESTING PURPOSES ONLY
 * @route GET /api/auth/test-spotify-connectivity
 */
export const testSpotifyConnectivity = async (req: Request, res: Response) => {
  try {
    console.log('Testing Spotify API connectivity...');
    
    // First try connecting to Spotify accounts API
    try {
      // Just try to reach the accounts.spotify.com domain with a simple request
      const accountsResponse = await axios.get('https://accounts.spotify.com/robots.txt', { 
        timeout: 5000,
        validateStatus: () => true // Accept any status
      });
      console.log('Successfully connected to Spotify accounts API:', accountsResponse.status);
      
      // Try the token endpoint with a HEAD request
      try {
        const tokenResponse = await axios.head('https://accounts.spotify.com/api/token', { 
          timeout: 5000,
          validateStatus: () => true // Accept any status
        });
        console.log('Successfully connected to Spotify token endpoint:', tokenResponse.status);
        
        res.json({ 
          canReachSpotify: true, 
          accountsStatus: accountsResponse.status,
          tokenStatus: tokenResponse.status,
          message: 'Successfully connected to Spotify API endpoints'
        });
      } catch (tokenError: any) {
        console.error('Failed to connect to Spotify token endpoint:', tokenError.message);
        
        res.json({ 
          canReachSpotify: true, 
          accountsStatus: accountsResponse.status,
          tokenError: tokenError.message,
          message: 'Connected to Spotify accounts but not to token endpoint'
        });
      }
    } catch (accountsError: any) {
      console.error('Failed to connect to Spotify accounts API:', accountsError.message);
      
      // Check if we have a response
      if (accountsError.response) {
        res.json({ 
          canReachSpotify: true, 
          accountsStatus: accountsError.response.status,
          message: 'Connected to Spotify accounts API but received error status',
          error: accountsError.message
        });
      } else if (accountsError.request) {
        // No response received
        res.json({ 
          canReachSpotify: false, 
          error: 'No response received from Spotify accounts API. This could be a network connectivity issue or a CORS problem.'
        });
      } else {
        // Something else went wrong
        res.json({ 
          canReachSpotify: false, 
          error: 'Error setting up request: ' + accountsError.message
        });
      }
    }
  } catch (error: any) {
    console.error('Spotify connectivity test failed with unexpected error:', error);
    res.status(500).json({ 
      canReachSpotify: false, 
      error: error.message 
    });
  }
};

/**
 * Return the Spotify login URL without redirecting - FOR TESTING PURPOSES ONLY
 * @route GET /api/auth/spotify/login-url
 */
export const getSpotifyLoginUrl = (req: Request, res: Response) => {
  try {
    // Generate and send back the URL
    const state = JSON.stringify({ userId: req.session.userId || null });
    const url = spotifyApi.getAuthorizationUrl(state);
    console.log('Generated Spotify login URL:', url);
    
    res.json({ url });
  } catch (error: any) {
    console.error('Error generating Spotify login URL:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Directly update user data - FOR TESTING PURPOSES ONLY
 * This endpoint should not be exposed in production!
 * @route POST /api/auth/direct-update-user
 */
export const directUpdateUser = async (req: Request, res: Response) => {
  try {
    // Skip this route in production
    if (process.env.NODE_ENV === 'production') {
      return res.status(404).json({ error: 'Not found' });
    }
    
    const schema = z.object({
      userId: z.number(),
      updateData: z.object({
        phoneVerified: z.boolean().optional(),
        emailVerified: z.boolean().optional(),
        spotifyVerified: z.boolean().optional(),
        phone: z.string().optional(),
        email: z.string().optional(),
        displayName: z.string().optional(),
        profileImage: z.string().optional(),
        spotifyId: z.string().optional(),
        preferredGenres: z.array(z.string()).optional(),
        notificationsEnabled: z.boolean().optional(),
        latitude: z.number().optional(),
        longitude: z.number().optional(),
      })
    });
    
    const validation = schema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        error: 'Invalid data',
        details: validation.error.format()
      });
    }
    
    const { userId, updateData } = validation.data;
    
    // Get user
    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Update user data directly (FOR TESTING ONLY)
    console.log(`[TEST] Directly updating user ${userId} with:`, updateData);
    await storage.updateUser(userId, updateData);
    
    // Get updated user
    const updatedUser = await storage.getUser(userId);
    if (!updatedUser) {
      return res.status(500).json({ error: 'Failed to retrieve updated user' });
    }
    
    // Create safe user object without password
    const userResponse = {
      ...updatedUser,
      password: undefined // Remove password from the response
    };
    
    res.status(200).json(userResponse);
  } catch (error) {
    console.error('Error with direct user update:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
};