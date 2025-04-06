import { Request, Response } from 'express';
import { storage } from '../storage';
import { insertUserSchema } from '@shared/schema';
import * as spotifyApi from '../utils/spotifyApi';
import { sendVerificationCode } from './verificationController';

/**
 * Initiates the Spotify authorization flow
 * Redirects the user to Spotify's authorization page
 * @route GET /api/auth/spotify/login
 */
export const initiateSpotifyLogin = (req: Request, res: Response) => {
  try {
    // Get userId from session if available
    const userId = req.session.userId;
    
    // Generate state parameter to include the userId for connecting accounts later
    const state = userId ? JSON.stringify({ userId }) : undefined;
    
    // Get authorization URL from Spotify API utils
    const authUrl = spotifyApi.getAuthorizationUrl(state);
    
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
    const { code, state } = req.query;
    
    if (!code) {
      return res.status(400).json({ error: 'Authorization code is required' });
    }
    
    // Exchange authorization code for tokens
    const tokenResponse = await spotifyApi.exchangeCodeForTokens(code as string);
    const { access_token, refresh_token, expires_in } = tokenResponse;
    
    // Get user profile from Spotify
    const spotifyProfile = await spotifyApi.getUserProfile(access_token);
    
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
      } catch (e) {
        console.error('Error parsing state parameter:', e);
      }
    }
    
    if (existingUserId) {
      // Connect Spotify to existing account
      const existingUser = await storage.getUser(existingUserId);
      
      if (existingUser) {
        user = await storage.updateUser(existingUser.id, {
          spotifyId: spotifyProfile.id,
          spotifyAccessToken: access_token,
          spotifyRefreshToken: refresh_token,
          displayName: spotifyProfile.display_name || existingUser.displayName,
          email: spotifyProfile.email || existingUser.email,
        });
      }
    } else if (!user) {
      // Create new user with Spotify data
      user = await storage.createUser({
        username: `user_${Date.now()}`,
        password: '', // No password for Spotify users
        displayName: spotifyProfile.display_name || 'Spotify User',
        email: spotifyProfile.email || '',
        phoneNumber: '',
        spotifyId: spotifyProfile.id,
        spotifyAccessToken: access_token,
        spotifyRefreshToken: refresh_token,
        emailVerified: spotifyProfile.email ? true : false, // Trust Spotify's email verification
        phoneVerified: false,
        notificationsEnabled: true,
      });
    } else {
      // Update existing user with new Spotify tokens
      user = await storage.updateUser(user.id, {
        spotifyAccessToken: access_token,
        spotifyRefreshToken: refresh_token,
        displayName: spotifyProfile.display_name || user.displayName,
        email: spotifyProfile.email || user.email,
      });
    }
    
    // Set user session
    if (!user) {
      return res.status(500).json({ error: 'Failed to create or update user' });
    }
    
    req.session.userId = user.id;
    
    // Redirect to auth success page
    res.redirect(`/auth-success?userId=${user.id}`);
  } catch (error) {
    console.error('Error handling Spotify callback:', error);
    res.status(500).json({ error: 'Failed to complete Spotify authentication' });
  }
};

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
    const existingUserByPhone = userData.phoneNumber 
      ? await storage.getUserByPhone(userData.phoneNumber) 
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
    
    // Send verification code for phone
    if (userData.phoneNumber) {
      await sendVerificationCode(req, res);
    }
    
    // Remove sensitive data before sending response
    const { password, ...userWithoutPassword } = user;
    
    res.status(201).json(userWithoutPassword);
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
    const { username, phoneNumber, password } = req.body;
    
    if ((!username && !phoneNumber) || !password) {
      return res.status(400).json({ error: 'Username/phone and password are required' });
    }
    
    // Find user by username or phone
    let user;
    if (username) {
      user = await storage.getUserByUsername(username);
    } else if (phoneNumber) {
      user = await storage.getUserByPhone(phoneNumber);
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