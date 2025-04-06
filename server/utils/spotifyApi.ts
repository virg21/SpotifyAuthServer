import axios from 'axios';
import querystring from 'querystring';
import { getEnv } from '../config/env';

// Spotify API URLs
const SPOTIFY_API_URL = 'https://api.spotify.com/v1';
const SPOTIFY_ACCOUNTS_URL = 'https://accounts.spotify.com/api';
const SPOTIFY_AUTH_URL = 'https://accounts.spotify.com/authorize';
const SPOTIFY_TOKEN_URL = 'https://accounts.spotify.com/api/token';

// Get Spotify credentials from environment variables
const getSpotifyCredentials = () => {
  const clientId = getEnv('SPOTIFY_CLIENT_ID');
  const clientSecret = getEnv('SPOTIFY_CLIENT_SECRET', false) || 'development_secret';
  const redirectUri = getEnv('REDIRECT_URI', false) || 'http://localhost:5000/api/auth/spotify/callback';
  
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
    // In development mode with missing client secret, return mock tokens
    if (clientSecret === 'development_secret' && process.env.NODE_ENV === 'development') {
      console.log('Using development mode tokens');
      return {
        access_token: 'mock_access_token',
        refresh_token: 'mock_refresh_token',
        expires_in: 3600,
      };
    }
    
    const response = await axios({
      method: 'post',
      url: SPOTIFY_TOKEN_URL,
      data: querystring.stringify({
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
      }),
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + Buffer.from(clientId + ':' + clientSecret).toString('base64'),
      },
    });
    
    return response.data;
  } catch (error: any) {
    console.error('Error exchanging code for tokens:', error.response?.data || error.message);
    throw new Error('Failed to exchange authorization code for tokens');
  }
};

// Refresh an expired access token
export const refreshAccessToken = async (refreshToken: string) => {
  const { clientId, clientSecret } = getSpotifyCredentials();
  
  try {
    // In development mode with missing client secret, return mock tokens
    if (clientSecret === 'development_secret' && process.env.NODE_ENV === 'development') {
      console.log('Using development mode access token refresh');
      return {
        access_token: 'mock_access_token_refreshed',
        expires_in: 3600,
      };
    }
    
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
    // In development mode with mock token, return mock profile
    if (accessToken.startsWith('mock_') && process.env.NODE_ENV === 'development') {
      console.log('Returning mock user profile');
      return {
        id: 'mock_spotify_id',
        display_name: 'Test User',
        email: 'test@example.com',
        images: [{ url: 'https://via.placeholder.com/150' }],
        country: 'US',
        product: 'premium',
      };
    }
    
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
    // In development mode with mock token, return mock top tracks
    if (accessToken.startsWith('mock_') && process.env.NODE_ENV === 'development') {
      console.log('Returning mock top tracks');
      return {
        items: Array(20).fill(null).map((_, i) => ({
          id: `track_${i}`,
          name: `Mock Track ${i}`,
          artists: [{ name: `Artist ${i % 5}` }],
          album: { name: `Album ${i % 10}` },
          popularity: Math.floor(Math.random() * 100),
        })),
      };
    }
    
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
    // In development mode with mock token, return mock top artists
    if (accessToken.startsWith('mock_') && process.env.NODE_ENV === 'development') {
      console.log('Returning mock top artists');
      return {
        items: Array(20).fill(null).map((_, i) => ({
          id: `artist_${i}`,
          name: `Mock Artist ${i}`,
          genres: [`genre_${i % 5}`, `genre_${(i + 3) % 8}`],
          popularity: Math.floor(Math.random() * 100),
          images: [{ url: 'https://via.placeholder.com/150' }],
        })),
      };
    }
    
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
    // In development mode with mock token, return mock recently played
    if (accessToken.startsWith('mock_') && process.env.NODE_ENV === 'development') {
      console.log('Returning mock recently played tracks');
      return {
        items: Array(20).fill(null).map((_, i) => ({
          track: {
            id: `recent_track_${i}`,
            name: `Mock Recent Track ${i}`,
            artists: [{ name: `Recent Artist ${i % 5}` }],
            album: { name: `Recent Album ${i % 10}` },
            popularity: Math.floor(Math.random() * 100),
          },
          played_at: new Date(Date.now() - i * 1000 * 60 * 60).toISOString(),
        })),
      };
    }
    
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
    // In development mode with mock token, return mock playlist
    if (accessToken.startsWith('mock_') && process.env.NODE_ENV === 'development') {
      console.log('Creating mock playlist');
      return {
        id: 'mock_playlist_id',
        name,
        description,
        public: isPublic,
        external_urls: {
          spotify: 'https://open.spotify.com/playlist/mock',
        },
      };
    }
    
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
    // In development mode with mock token, return success
    if (accessToken.startsWith('mock_') && process.env.NODE_ENV === 'development') {
      console.log('Adding tracks to mock playlist');
      return {
        snapshot_id: 'mock_snapshot_id',
      };
    }
    
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