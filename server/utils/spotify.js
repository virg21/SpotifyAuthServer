import axios from 'axios';
import querystring from 'querystring';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current file directory in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Set environment variables directly if not already set
if (!process.env.SPOTIFY_CLIENT_ID) {
  process.env.SPOTIFY_CLIENT_ID = '57519508ca914e789ad1ddab2b937739';
}
if (!process.env.SPOTIFY_CLIENT_SECRET) {
  process.env.SPOTIFY_CLIENT_SECRET = '18ff12265ce24d689fd438b39d94799a';
}
if (!process.env.REDIRECT_URI) {
  process.env.REDIRECT_URI = 'https://workspace.vliste415.repl.co/api/auth/callback';
}

// Spotify API endpoints
const SPOTIFY_AUTH_URL = 'https://accounts.spotify.com/authorize';
const SPOTIFY_TOKEN_URL = 'https://accounts.spotify.com/api/token';
const SPOTIFY_API_URL = 'https://api.spotify.com/v1';

// Spotify credentials
const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
// Make sure to register this exact URI in your Spotify Developer Dashboard
const REDIRECT_URI = process.env.REDIRECT_URI;

// Log configuration for debugging
console.log('Spotify Configuration:');
console.log('Client ID:', CLIENT_ID ? 'Configured ✓' : 'Missing ✗');
console.log('Client Secret:', CLIENT_SECRET ? 'Configured ✓' : 'Missing ✗');
console.log('Redirect URI:', REDIRECT_URI);

// Required scopes for the application
const SCOPES = [
  'user-top-read',
  'playlist-read-private',
  'user-library-read'
];

/**
 * Generate the authorization URL for Spotify login
 * @returns {string} The Spotify authorization URL
 */
const getAuthUrl = () => {
  const params = {
    client_id: CLIENT_ID,
    response_type: 'code',
    redirect_uri: REDIRECT_URI,
    scope: SCOPES.join(' '),
    show_dialog: true  // Force login dialog for testing
  };

  return `${SPOTIFY_AUTH_URL}?${querystring.stringify(params)}`;
};

/**
 * Exchange an authorization code for access and refresh tokens
 * @param {string} code - The authorization code from Spotify
 * @returns {Promise<Object>} The token response
 */
const exchangeCodeForTokens = async (code) => {
  try {
    console.log('Exchanging code for tokens...');
    
    const response = await axios({
      method: 'post',
      url: SPOTIFY_TOKEN_URL,
      data: querystring.stringify({
        grant_type: 'authorization_code',
        code,
        redirect_uri: REDIRECT_URI
      }),
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64')
      }
    });

    console.log('Token exchange successful');
    return response.data;
  } catch (error) {
    console.error('Error exchanging code for tokens:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error(error.message);
    }
    throw error;
  }
};

/**
 * Get a user's profile information
 * @param {string} accessToken - The Spotify access token
 * @returns {Promise<Object>} The user profile data
 */
const getUserProfile = async (accessToken) => {
  try {
    const response = await axios.get(`${SPOTIFY_API_URL}/me`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error getting user profile:', error.message);
    throw error;
  }
};

export {
  getAuthUrl,
  exchangeCodeForTokens,
  getUserProfile
};