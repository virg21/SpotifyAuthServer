import axios from 'axios';
import querystring from 'querystring';
import { getEnv } from '../config/env';

// Spotify API URLs
const SPOTIFY_API_URL = 'https://api.spotify.com/v1';
const SPOTIFY_ACCOUNTS_URL = 'https://accounts.spotify.com/api';
const SPOTIFY_AUTH_URL = 'https://accounts.spotify.com/authorize';
const SPOTIFY_TOKEN_URL = 'https://accounts.spotify.com/api/token';

// Get Spotify credentials from environment variables
export const getSpotifyCredentials = () => {
  const clientId = getEnv('SPOTIFY_CLIENT_ID');
  const clientSecret = getEnv('SPOTIFY_CLIENT_SECRET', false) || 'development_secret';
  
  // ALWAYS use the exact URI registered in the Spotify Developer Dashboard
  // This must match *exactly*, including the protocol, domain, and path
  const redirectUri = 'https://workspace.vliste415.repl.co/api/auth/callback';
  
  // Log that we're using the hardcoded URI
  console.log('Using hardcoded Spotify redirect URI:', redirectUri);
  console.log('This URI *must* be registered in your Spotify Developer Dashboard');
  
  // Verify it matches environment variables (for debugging only)
  if (process.env.REDIRECT_URI && process.env.REDIRECT_URI !== redirectUri) {
    console.warn('WARNING: Environment variable REDIRECT_URI does not match hardcoded value');
    console.warn('ENV:', process.env.REDIRECT_URI);
    console.warn('Hardcoded:', redirectUri);
    console.warn('Using hardcoded value for reliability');
  }
  
  // Log detailed environment information to help with debugging
  console.log('Environment info:', {
    NODE_ENV: process.env.NODE_ENV,
    REPL_SLUG: process.env.REPL_SLUG,
    REPL_OWNER: process.env.REPL_OWNER,
    REPL_ID: process.env.REPL_ID
  });
  
  console.log('Spotify credentials:', { clientId, clientSecret: '***HIDDEN***', redirectUri });
  console.log('IMPORTANT: Make sure this exact URI is registered in your Spotify Developer Dashboard:');
  console.log(redirectUri);
  
  return { clientId, clientSecret, redirectUri };
};

// Scopes needed for our application
const SPOTIFY_SCOPES = [
  'user-read-private',
  'user-read-email',
  'user-top-read',
  'user-read-recently-played',
  'playlist-modify-public',
  'playlist-modify-private',
  'user-read-currently-playing'
];

// Generate the Spotify authorization URL
export const getAuthorizationUrl = (state?: string) => {
  const { clientId, redirectUri } = getSpotifyCredentials();
  
  const params: Record<string, string> = {
    client_id: clientId,
    response_type: 'code',
    redirect_uri: redirectUri,
    scope: SPOTIFY_SCOPES.join(' '),
    show_dialog: 'true', // Force prompt each time during development
  };
  
  if (state) {
    params.state = state;
  }
  
  return `${SPOTIFY_AUTH_URL}?${querystring.stringify(params)}`;
};

// Exchange authorization code for tokens
export const exchangeCodeForTokens = async (code: string) => {
  const { clientId, clientSecret, redirectUri } = getSpotifyCredentials();
  
  try {
    console.log('Exchanging code for tokens with params:', {
      code: code.substring(0, 5) + '...',
      redirect_uri: redirectUri
    });
    
    const requestData = querystring.stringify({
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri,
    });
    
    console.log('Request data:', requestData);
    
    const response = await axios({
      method: 'post',
      url: SPOTIFY_TOKEN_URL,
      data: requestData,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + Buffer.from(clientId + ':' + clientSecret).toString('base64'),
      },
    });
    
    console.log('Token exchange successful');
    return response.data;
  } catch (error: any) {
    console.error('Error exchanging code for tokens:');
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
      console.error('Response headers:', error.response.headers);
    } else if (error.request) {
      console.error('No response received:', error.request);
    } else {
      console.error('Error message:', error.message);
    }
    
    // Include more details in the error message
    const errorDetails = error.response?.data?.error_description || error.message;
    throw new Error(`Failed to exchange authorization code for tokens: ${errorDetails}`);
  }
};

// Refresh an expired access token
export const refreshAccessToken = async (refreshToken: string) => {
  const { clientId, clientSecret } = getSpotifyCredentials();
  
  try {
    const response = await axios({
      method: 'post',
      url: SPOTIFY_TOKEN_URL,
      data: querystring.stringify({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
      }),
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + Buffer.from(clientId + ':' + clientSecret).toString('base64'),
      },
    });
    
    return response.data;
  } catch (error: any) {
    console.error('Error refreshing access token:', error.response?.data || error.message);
    throw new Error('Failed to refresh access token');
  }
};

// Get the user's profile
export const getUserProfile = async (accessToken: string) => {
  try {
    
    const response = await axios({
      method: 'get',
      url: `${SPOTIFY_API_URL}/me`,
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });
    
    return response.data;
  } catch (error: any) {
    console.error('Error getting user profile:', error.response?.data || error.message);
    throw new Error('Failed to get user profile');
  }
};

// Get user's top tracks
export const getUserTopTracks = async (accessToken: string, timeRange = 'medium_term', limit = 50) => {
  try {
    
    const response = await axios({
      method: 'get',
      url: `${SPOTIFY_API_URL}/me/top/tracks`,
      params: {
        time_range: timeRange, // short_term, medium_term, long_term
        limit,
      },
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });
    
    return response.data;
  } catch (error: any) {
    console.error('Error getting top tracks:', error.response?.data || error.message);
    throw new Error('Failed to get top tracks');
  }
};

// Get user's top artists
export const getUserTopArtists = async (accessToken: string, timeRange = 'medium_term', limit = 50) => {
  try {
    
    const response = await axios({
      method: 'get',
      url: `${SPOTIFY_API_URL}/me/top/artists`,
      params: {
        time_range: timeRange, // short_term, medium_term, long_term
        limit,
      },
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });
    
    return response.data;
  } catch (error: any) {
    console.error('Error getting top artists:', error.response?.data || error.message);
    throw new Error('Failed to get top artists');
  }
};

// Get user's recently played tracks
export const getRecentlyPlayedTracks = async (accessToken: string, limit = 50) => {
  try {
    
    const response = await axios({
      method: 'get',
      url: `${SPOTIFY_API_URL}/me/player/recently-played`,
      params: {
        limit,
      },
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });
    
    return response.data;
  } catch (error: any) {
    console.error('Error getting recently played tracks:', error.response?.data || error.message);
    throw new Error('Failed to get recently played tracks');
  }
};

// Create a playlist
export const createPlaylist = async (accessToken: string, userId: string, name: string, description: string, isPublic = true) => {
  try {
    
    const response = await axios({
      method: 'post',
      url: `${SPOTIFY_API_URL}/users/${userId}/playlists`,
      data: {
        name,
        description,
        public: isPublic,
      },
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });
    
    return response.data;
  } catch (error: any) {
    console.error('Error creating playlist:', error.response?.data || error.message);
    throw new Error('Failed to create playlist');
  }
};

// Add tracks to a playlist
export const addTracksToPlaylist = async (accessToken: string, playlistId: string, trackUris: string[]) => {
  try {
    
    const response = await axios({
      method: 'post',
      url: `${SPOTIFY_API_URL}/playlists/${playlistId}/tracks`,
      data: {
        uris: trackUris,
      },
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });
    
    return response.data;
  } catch (error: any) {
    console.error('Error adding tracks to playlist:', error.response?.data || error.message);
    throw new Error('Failed to add tracks to playlist');
  }
};