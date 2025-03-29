import { Request, Response } from 'express';
import { storage } from '../storage';
import { SpotifyApi } from '../utils/spotifyApi';

/**
 * Generate music personality summary for a user
 * @route GET /api/music/summary
 */
export const getMusicSummary = async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userId || '1');
    
    // Check if we already have a recent summary stored
    const existingSummary = await storage.getMusicSummary(userId);
    if (existingSummary) {
      const lastUpdated = existingSummary.lastUpdated ? new Date(existingSummary.lastUpdated) : new Date();
      const now = new Date();
      const hoursSinceUpdate = (now.getTime() - lastUpdated.getTime()) / (1000 * 60 * 60);
      
      // Return existing summary if it's less than 24 hours old
      if (hoursSinceUpdate < 24) {
        return res.status(200).json(existingSummary);
      }
    }
    
    // Get user for access token
    const user = await storage.getUser(userId);
    if (!user || !user.accessToken) {
      return res.status(400).json({ 
        message: 'User not found or not authenticated with Spotify'
      });
    }
    
    // Create Spotify API client with the user's access token
    const spotifyApi = new SpotifyApi(user.accessToken);
    
    // Generate a new music personality summary
    const musicSummary = await spotifyApi.generateMusicPersonalitySummary();
    
    // Store in database or update existing
    let savedSummary;
    if (existingSummary) {
      savedSummary = await storage.updateMusicSummary(existingSummary.id, {
        topArtists: musicSummary.topArtists,
        topTracks: musicSummary.topTracks,
        topGenres: musicSummary.topGenres,
        moodScore: musicSummary.moodScore,
        genreProfile: musicSummary.genreProfile,
        eraBias: musicSummary.eraBias
      });
    } else {
      savedSummary = await storage.createMusicSummary({
        userId,
        topArtists: musicSummary.topArtists,
        topTracks: musicSummary.topTracks,
        topGenres: musicSummary.topGenres,
        moodScore: musicSummary.moodScore,
        genreProfile: musicSummary.genreProfile,
        eraBias: musicSummary.eraBias,
        lastUpdated: new Date()
      });
    }
    
    res.status(200).json(savedSummary);
  } catch (error: unknown) {
    console.error('Error generating music summary:', error);
    
    // Handle expired tokens by suggesting token refresh
    if (error && typeof error === 'object' && 'response' in error && 
        error.response && typeof error.response === 'object' && 
        'status' in error.response && error.response.status === 401) {
      return res.status(401).json({ 
        message: 'Spotify access token expired',
        error: 'TOKEN_EXPIRED'
      });
    }
    
    res.status(500).json({ message: 'Error generating music summary' });
  }
};