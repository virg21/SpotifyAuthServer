import express, { Request, Response } from 'express';
import axios from 'axios';
import querystring from 'querystring';
import { getEnv } from '../config/env';
import { storage } from '../storage';
import { SpotifyApi } from '../utils/spotifyApi';

/**
 * Initiates the Spotify authorization flow
 * Redirects the user to Spotify's authorization page
 */
export const login = (req: Request, res: Response) => {
  try {
    // Generate a random state for CSRF protection
    const state = Math.random().toString(36).substring(2, 15);
    
    // Set state in session
    req.session.state = state;
    
    // Define the scopes for permissions
    const scope = [
      'user-read-private',
      'user-read-email',
      'user-top-read',
      'user-read-recently-played',
      'user-library-read'
    ].join(' ');
    
    const spotifyAuthUrl = 'https://accounts.spotify.com/authorize?' + 
      querystring.stringify({
        response_type: 'code',
        client_id: getEnv('SPOTIFY_CLIENT_ID'),
        scope: scope,
        redirect_uri: getEnv('REDIRECT_URI'),
        state: state
      });
    
    // Redirect to Spotify login
    res.redirect(spotifyAuthUrl);
  } catch (error) {
    console.error('Error in login:', error);
    res.status(500).json({ message: 'Error initiating authentication flow' });
  }
};

/**
 * Handles the callback from Spotify authorization
 * Exchanges authorization code for access and refresh tokens
 */
export const callback = async (req: Request, res: Response) => {
  try {
    const code = req.query.code as string;
    const state = req.query.state as string;
    
    // Verify state matches to prevent CSRF
    if (state !== req.session.state) {
      return res.status(403).json({ message: 'State mismatch' });
    }
    
    // Clear state from session
    req.session.state = undefined;
    
    // Exchange code for tokens
    const tokenResponse = await axios({
      method: 'post',
      url: 'https://accounts.spotify.com/api/token',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + Buffer.from(
          getEnv('SPOTIFY_CLIENT_ID') + ':' + getEnv('SPOTIFY_CLIENT_SECRET')
        ).toString('base64')
      },
      data: querystring.stringify({
        code: code,
        redirect_uri: getEnv('REDIRECT_URI'),
        grant_type: 'authorization_code'
      })
    });
    
    const { access_token, refresh_token, expires_in } = tokenResponse.data;
    
    // Get user profile from Spotify
    const spotifyApi = new SpotifyApi(access_token);
    const profile = await spotifyApi.getCurrentUserProfile();
    
    // Check if user exists in our database
    let user = await storage.getUserBySpotifyId(profile.id);
    
    if (!user) {
      // Create new user
      user = await storage.createUser({
        username: profile.id,
        password: 'spotify-auth-' + Math.random().toString(36).substring(2, 15), // Placeholder password
        displayName: profile.display_name,
        email: profile.email,
        birthday: null,
        spotifyId: profile.id,
        accessToken: access_token,
        refreshToken: refresh_token
      });
      
      console.log('Created new user:', user.id);
    } else {
      // Update existing user's tokens
      user = await storage.updateUser(user.id, {
        accessToken: access_token,
        refreshToken: refresh_token,
        displayName: profile.display_name,
        email: profile.email
      }) || user;
      
      console.log('Updated user:', user.id);
    }
    
    // Store user ID in session
    req.session.userId = user.id;
    
    // Redirect to frontend success page
    res.redirect('/auth-success?userId=' + user.id);
  } catch (error) {
    console.error('Error in callback:', error);
    res.status(500).json({ message: 'Error completing authentication' });
  }
};

/**
 * Refreshes an expired access token using the refresh token
 */
export const refreshToken = async (req: Request, res: Response) => {
  try {
    const { refresh_token } = req.body;
    
    if (!refresh_token) {
      return res.status(400).json({ message: 'Refresh token is required' });
    }
    
    // Refresh the token
    const tokenData = await SpotifyApi.refreshAccessToken(refresh_token);
    
    // If user ID is in the session, update the stored tokens
    if (req.session.userId) {
      const user = await storage.getUser(req.session.userId);
      if (user) {
        await storage.updateUser(user.id, {
          accessToken: tokenData.access_token
        });
      }
    }
    
    res.status(200).json({
      access_token: tokenData.access_token,
      expires_in: tokenData.expires_in
    });
  } catch (error) {
    console.error('Error refreshing token:', error);
    res.status(500).json({ message: 'Error refreshing token' });
  }
};