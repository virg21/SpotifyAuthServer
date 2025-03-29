import { Request, Response } from "express";
import axios from "axios";
import querystring from "querystring";
import { getEnv } from "../config/env";

/**
 * Initiates the Spotify authorization flow
 * Redirects the user to Spotify's authorization page
 */
export const login = (req: Request, res: Response) => {
  try {
    // Get configuration from environment variables
    const clientId = getEnv("SPOTIFY_CLIENT_ID");
    const redirectUri = getEnv("SPOTIFY_REDIRECT_URI");
    
    // Define scopes for Spotify permissions
    // Add or remove scopes based on what your application needs
    const scopes = [
      'user-read-private',
      'user-read-email',
      'user-library-read'
    ].join(' ');
    
    // Construct Spotify authorization URL
    const spotifyAuthUrl = 
      'https://accounts.spotify.com/authorize?' +
      querystring.stringify({
        response_type: 'code',
        client_id: clientId,
        scope: scopes,
        redirect_uri: redirectUri,
        // Generate a random state for CSRF protection
        state: Math.random().toString(36).substring(2, 15)
      });
    
    // Redirect user to Spotify authorization page
    res.redirect(spotifyAuthUrl);
  } catch (error) {
    console.error('Error in login controller:', error);
    res.status(500).json({ error: 'Failed to initiate Spotify authorization' });
  }
};

/**
 * Handles the callback from Spotify authorization
 * Exchanges authorization code for access and refresh tokens
 */
export const callback = async (req: Request, res: Response) => {
  try {
    const { code, state } = req.query;
    
    // Verify if the code exists
    if (!code) {
      return res.status(400).json({ error: 'Authorization code not found' });
    }
    
    // Get configuration from environment variables
    const clientId = getEnv("SPOTIFY_CLIENT_ID");
    const clientSecret = getEnv("SPOTIFY_CLIENT_SECRET");
    const redirectUri = getEnv("SPOTIFY_REDIRECT_URI");
    
    // Exchange authorization code for access token and refresh token
    const tokenResponse = await axios({
      method: 'post',
      url: 'https://accounts.spotify.com/api/token',
      data: querystring.stringify({
        code: code as string,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code'
      }),
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + Buffer.from(clientId + ':' + clientSecret).toString('base64')
      }
    });
    
    const { access_token, refresh_token, expires_in, token_type } = tokenResponse.data;
    
    // Respond with tokens
    // In a real application, you might want to store these tokens securely,
    // set them as cookies, or provide a frontend the means to store them
    res.json({
      access_token,
      refresh_token,
      expires_in,
      token_type
    });
    
  } catch (error) {
    console.error('Error in callback controller:', error);
    if (axios.isAxiosError(error)) {
      const status = error.response?.status || 500;
      const message = error.response?.data?.error || 'Failed to exchange authorization code';
      return res.status(status).json({ error: message });
    }
    res.status(500).json({ error: 'Failed to exchange authorization code' });
  }
};

/**
 * Refreshes an expired access token using the refresh token
 */
export const refreshToken = async (req: Request, res: Response) => {
  try {
    const { refresh_token } = req.body;
    
    if (!refresh_token) {
      return res.status(400).json({ error: 'Refresh token is required' });
    }
    
    // Get configuration from environment variables
    const clientId = getEnv("SPOTIFY_CLIENT_ID");
    const clientSecret = getEnv("SPOTIFY_CLIENT_SECRET");
    
    // Request a new access token using the refresh token
    const response = await axios({
      method: 'post',
      url: 'https://accounts.spotify.com/api/token',
      data: querystring.stringify({
        grant_type: 'refresh_token',
        refresh_token: refresh_token
      }),
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + Buffer.from(clientId + ':' + clientSecret).toString('base64')
      }
    });
    
    const { access_token, expires_in } = response.data;
    
    // Return the new access token
    res.json({
      access_token,
      expires_in
    });
    
  } catch (error) {
    console.error('Error refreshing token:', error);
    if (axios.isAxiosError(error)) {
      const status = error.response?.status || 500;
      const message = error.response?.data?.error || 'Failed to refresh token';
      return res.status(status).json({ error: message });
    }
    res.status(500).json({ error: 'Failed to refresh token' });
  }
};
