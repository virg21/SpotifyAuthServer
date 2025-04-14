import express from 'express';
import path from 'path';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

// Get current file directory in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from the Spotify-specific .env file
dotenv.config({ path: '.env.spotify' });

// Log environment variables to verify they are loading correctly
console.log('Environment variables loaded from .env.spotify:');
console.log('SPOTIFY_CLIENT_ID:', process.env.SPOTIFY_CLIENT_ID ? 'Configured ✓' : 'Missing ✗');
console.log('SPOTIFY_CLIENT_SECRET:', process.env.SPOTIFY_CLIENT_SECRET ? 'Configured ✓' : 'Missing ✗');
console.log('REDIRECT_URI:', process.env.REDIRECT_URI);

// Import routes (will convert spotifyRoutes to ESM next)
import spotifyRoutes from './server/routes/spotifyRoutes.js';

// Create Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Mount API routes
app.use('/api', spotifyRoutes);

// Serve the main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Success page route
app.get('/success', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'success.html'));
});

// Start the server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Welcome page: http://localhost:${PORT}`);
  console.log(`Callback URL (must match Spotify Dashboard): ${process.env.REDIRECT_URI}`);
});