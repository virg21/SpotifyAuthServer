import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import axios from 'axios';

// Load environment variables
dotenv.config();

// Create Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Important constants for Spotify Auth
const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID || '57519508ca914e789ad1ddab2b937739';
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET || '18ff12265ce24d689fd438b39d94799a';
// IMPORTANT: This exact URI must be registered in the Spotify Developer Dashboard
// For Railway deployment, ensure this matches what's registered in Spotify Developer Dashboard
const REDIRECT_URI = process.env.REDIRECT_URI || 'https://spotifyauthserver-production.up.railway.app/api/auth/callback';
const SPOTIFY_AUTH_URL = 'https://accounts.spotify.com/authorize';
const SPOTIFY_TOKEN_URL = 'https://accounts.spotify.com/api/token';
const SCOPES = ['user-top-read', 'playlist-read-private', 'user-library-read'];

// Middleware - keep it minimal for reliability
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root route - simple status check
app.get('/', (req, res) => {
  res.send({
    status: 'Spotify Auth Server is running',
    routes: {
      '/api/login': 'Initiate Spotify authentication',
      '/api/auth/callback': 'Spotify callback handler',
      '/api/test': 'Test endpoint',
      '/health': 'Health check endpoint'
    }
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
  });
});

// Debug route - shows server configuration
app.get('/api/test', (req, res) => {
  res.status(200).json({
    message: 'Railway Spotify Auth Server is working!',
    timestamp: new Date().toISOString(),
    environment: {
      CLIENT_ID: CLIENT_ID ? CLIENT_ID.substring(0, 5) + '...' : 'Not set',
      REDIRECT_URI: REDIRECT_URI || 'Not set',
      NODE_ENV: process.env.NODE_ENV || 'development'
    }
  });
});

// Login route - redirects to Spotify authorization page
app.get('/api/login', (req, res) => {
  console.log('Received request to /api/login');
  try {
    const authUrl = `${SPOTIFY_AUTH_URL}?` +
      `client_id=${CLIENT_ID}&` +
      `response_type=code&` +
      `redirect_uri=${encodeURIComponent(REDIRECT_URI)}&` +
      `scope=${encodeURIComponent(SCOPES.join(' '))}&` +
      `show_dialog=true`;

    console.log('Redirecting to Spotify:', authUrl);
    res.redirect(authUrl);
  } catch (error) {
    console.error('Error initiating Spotify login:', error);
    res.status(500).json({ error: 'Failed to initiate Spotify login' });
  }
});

// Callback route - handles the code exchange after Spotify authorization
app.get('/api/auth/callback', async (req, res) => {
  try {
    const { code } = req.query;
    
    if (!code) {
      return res.status(400).send('Authorization code is required');
    }
    
    console.log('Received code from Spotify, exchanging for tokens...');
    
    // Exchange code for tokens
    const tokenResponse = await axios({
      method: 'post',
      url: SPOTIFY_TOKEN_URL,
      params: {
        grant_type: 'authorization_code',
        code,
        redirect_uri: REDIRECT_URI
      },
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64')
      }
    });

    const { access_token, refresh_token } = tokenResponse.data;
    
    // Show success page
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Spotify Authentication Success</title>
          <style>
            body { font-family: Arial, sans-serif; text-align: center; padding: 40px; }
            h1 { color: #1DB954; }
            .success-mark { font-size: 72px; color: #1DB954; }
          </style>
          <script>
            window.onload = function() {
              if (window.opener) {
                window.opener.postMessage({ 
                  type: 'SPOTIFY_AUTH_SUCCESS',
                  payload: {
                    access_token: "${access_token}",
                    refresh_token: "${refresh_token}"
                  }
                }, '*');
                setTimeout(() => window.close(), 2000);
              }
            }
          </script>
        </head>
        <body>
          <div class="success-mark">✓</div>
          <h1>Authentication Successful!</h1>
          <p>You have successfully connected your Spotify account.</p>
          <p>You can close this window and return to the application.</p>
        </body>
      </html>
    `;
    
    res.send(html);
  } catch (error) {
    console.error('Error handling Spotify callback:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
    
    res.status(500).send(`
      <html>
        <head><title>Authentication Error</title></head>
        <body>
          <h1>Authentication Failed</h1>
          <p>There was an error authenticating with Spotify.</p>
          <p>Error: ${error.message}</p>
        </body>
      </html>
    `);
  }
});

// Legacy route support
app.get('/auth/spotify/login', (req, res) => {
  console.log('Received request to legacy /auth/spotify/login, redirecting to /api/login');
  res.redirect('/api/login');
});

// Legacy callback support
app.get('/auth/spotify/callback', (req, res) => {
  console.log('Received request to legacy callback, redirecting to /api/auth/callback');
  res.redirect(`/api/auth/callback?${new URLSearchParams(req.query).toString()}`);
});

// Status endpoint to check authentication status
app.get('/auth/spotify/status', (req, res) => {
  console.log('Received request to check Spotify auth status');
  res.status(200).json({
    success: true,
    message: 'Spotify authentication successful',
    timestamp: new Date().toISOString(),
  });
});

// Start the server
app.listen(PORT, '0.0.0.0', () => {
  console.log('='.repeat(50));
  console.log(`Spotify Auth Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Redirect URI: ${REDIRECT_URI}`);
  console.log('='.repeat(50));
});