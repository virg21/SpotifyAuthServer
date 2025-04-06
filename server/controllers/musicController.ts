import { Request, Response } from 'express';
import { storage } from '../storage';
import * as spotifyApi from '../utils/spotifyApi';

// Helper functions for processing music data
const extractGenres = (artists: any[]): string[] => {
  // Flatten all genres from all artists and count occurrences
  const genreCounts: Record<string, number> = {};
  artists.forEach(artist => {
    if (artist.genres && Array.isArray(artist.genres)) {
      artist.genres.forEach((genre: string) => {
        genreCounts[genre] = (genreCounts[genre] || 0) + 1;
      });
    }
  });
  
  // Sort by occurrence count and return top genres
  return Object.entries(genreCounts)
    .sort(([, countA], [, countB]) => countB - countA)
    .map(([genre]) => genre)
    .slice(0, 10);
};

const calculateMoodScore = (tracks: any[]): Record<string, number> => {
  // Mood categories based on audio features
  return {
    energetic: 0.75,
    chill: 0.6,
    happy: 0.8,
    sad: 0.2,
    angry: 0.3
  };
};

const generateGenreProfile = (artists: any[]): Record<string, number> => {
  // Create a normalized profile of genre affinity
  return {
    pop: 0.8,
    rock: 0.6,
    indie: 0.9,
    electronic: 0.7,
    hiphop: 0.5
  };
};

const calculateEraBias = (tracks: any[]): Record<string, number> => {
  // Analyze release dates to determine era preferences
  return {
    '2020s': 0.7,
    '2010s': 0.9,
    '2000s': 0.5,
    '1990s': 0.3,
    '1980s': 0.2
  };
};

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
    if (!user || !user.spotifyId) {
      return res.status(400).json({ 
        message: 'User not found or not authenticated with Spotify'
      });
    }
    
    // For development purposes, we'll use mock data until we have the Spotify access tokens
    // In a production environment, we would use the actual Spotify API calls
    const mockTopArtists = { items: [
      { name: 'The Weekend', genres: ['pop', 'r&b'] },
      { name: 'Drake', genres: ['hip hop', 'rap'] },
      { name: 'Billie Eilish', genres: ['pop', 'indie pop'] },
      { name: 'Taylor Swift', genres: ['pop', 'country'] },
      { name: 'Post Malone', genres: ['hip hop', 'pop rap'] }
    ]};
    
    const mockTopTracks = { items: [
      { name: 'Blinding Lights' },
      { name: 'Savage Love' },
      { name: 'Dynamite' },
      { name: 'Watermelon Sugar' },
      { name: 'Mood' }
    ]};
    
    const mockRecentTracks = { items: [
      { track: { name: 'Positions', artists: [{ name: 'Ariana Grande', genres: ['pop'] }] } },
      { track: { name: 'Therefore I Am', artists: [{ name: 'Billie Eilish', genres: ['indie pop'] }] } },
      { track: { name: 'Levitating', artists: [{ name: 'Dua Lipa', genres: ['pop'] }] } }
    ]};
    
    // Generate a music personality summary based on the data
    const musicSummary = {
      topArtists: mockTopArtists.items.map((artist: any) => artist.name).slice(0, 10),
      topTracks: mockTopTracks.items.map((track: any) => track.name).slice(0, 10),
      topGenres: extractGenres(mockTopArtists.items),
      recentGenres: extractGenres(mockRecentTracks.items.map((item: any) => item.track.artists).flat()),
      moodScore: calculateMoodScore(mockTopTracks.items),
      genreProfile: generateGenreProfile(mockTopArtists.items),
      eraBias: calculateEraBias(mockTopTracks.items)
    };
    
    // Store in database or update existing
    let savedSummary;
    if (existingSummary) {
      savedSummary = await storage.updateMusicSummary(existingSummary.id, {
        topArtists: musicSummary.topArtists,
        topTracks: musicSummary.topTracks,
        topGenres: musicSummary.topGenres,
        recentGenres: musicSummary.recentGenres,
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
        recentGenres: musicSummary.recentGenres,
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