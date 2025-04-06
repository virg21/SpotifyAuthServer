import { Request, Response } from 'express';
import { storage } from '../storage';
import * as spotifyApi from '../utils/spotifyApi';
import axios from 'axios';

// Helper function to get audio features for tracks
async function getAudioFeatures(accessToken: string, trackIds: string[]) {
  try {
    // In development mode with mock token, return mock data
    if (accessToken.startsWith('mock_') && process.env.NODE_ENV === 'development') {
      console.log('Returning mock audio features');
      return {
        audio_features: trackIds.map(id => ({
          id,
          energy: Math.random(),
          valence: Math.random(),
          danceability: Math.random(),
          tempo: 80 + Math.random() * 80,
          acousticness: Math.random(),
          instrumentalness: Math.random(),
        }))
      };
    }
    
    // Make batched requests for audio features (max 100 tracks per request)
    const batchSize = 100;
    const batches = [];
    
    for (let i = 0; i < trackIds.length; i += batchSize) {
      const batchIds = trackIds.slice(i, i + batchSize);
      batches.push(
        axios({
          method: 'get',
          url: `https://api.spotify.com/v1/audio-features`,
          params: {
            ids: batchIds.join(',')
          },
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        })
      );
    }
    
    const responses = await Promise.all(batches);
    const audioFeatures = responses.reduce((acc, response) => {
      return {...acc, audio_features: [...acc.audio_features, ...response.data.audio_features]};
    }, { audio_features: [] });
    
    return audioFeatures;
  } catch (error) {
    console.error('Error fetching audio features:', error);
    throw error;
  }
}

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
    .sort(([, countA], [, countB]) => (countB as number) - (countA as number))
    .map(([genre]) => genre)
    .slice(0, 10);
};

const calculateMoodScore = (audioFeatures: any[]): Record<string, number> => {
  if (!audioFeatures || !audioFeatures.length) {
    return {
      energetic: 0.5,
      chill: 0.5,
      happy: 0.5,
      sad: 0.5,
      angry: 0.5
    };
  }
  
  // Calculate average values for relevant audio features
  let totalEnergy = 0;
  let totalValence = 0;
  let totalDanceability = 0;
  let totalTempo = 0;
  let totalAcousticness = 0;
  let count = 0;
  
  audioFeatures.forEach(feature => {
    if (feature) {
      totalEnergy += feature.energy || 0;
      totalValence += feature.valence || 0; // Happiness level in Spotify
      totalDanceability += feature.danceability || 0;
      totalTempo += feature.tempo || 0;
      totalAcousticness += feature.acousticness || 0;
      count++;
    }
  });
  
  if (count === 0) return { energetic: 0.5, chill: 0.5, happy: 0.5, sad: 0.5, angry: 0.5 };
  
  const avgEnergy = totalEnergy / count;
  const avgValence = totalValence / count;
  const avgDanceability = totalDanceability / count;
  const avgTempo = totalTempo / count;
  const avgAcousticness = totalAcousticness / count;
  
  // Map audio features to mood scores
  return {
    energetic: avgEnergy * 0.6 + (avgTempo / 200) * 0.4, // Energy + fast tempo
    chill: (1 - avgEnergy) * 0.5 + avgAcousticness * 0.5, // Low energy + acoustic
    happy: avgValence * 0.7 + avgDanceability * 0.3, // High valence + danceable
    sad: (1 - avgValence) * 0.8 + (1 - avgDanceability) * 0.2, // Low valence + not danceable
    angry: avgEnergy * 0.7 + (1 - avgValence) * 0.3 // High energy + low valence
  };
};

const generateGenreProfile = (artists: any[]): Record<string, number> => {
  // Create a normalized profile of genre affinity based on actual genres
  const genreMap: Record<string, number> = {};
  const topLevelGenres = [
    'pop', 'rock', 'hip hop', 'rap', 'r&b', 'indie', 'electronic', 
    'dance', 'metal', 'jazz', 'classical', 'country', 'folk', 'latin'
  ];
  
  // Initialize with zeros
  topLevelGenres.forEach(genre => {
    genreMap[genre] = 0;
  });
  
  // Count occurrences of top-level genres
  let totalGenreMentions = 0;
  
  artists.forEach(artist => {
    if (artist.genres && Array.isArray(artist.genres)) {
      artist.genres.forEach((genre: string) => {
        // Map subgenres to their parent genres
        const matchedParent = topLevelGenres.find(parent => 
          genre.includes(parent) || (parent === 'r&b' && genre.includes('rnb'))
        );
        
        if (matchedParent) {
          genreMap[matchedParent] += 1;
          totalGenreMentions += 1;
        }
      });
    }
  });
  
  // Normalize values to [0,1] range
  if (totalGenreMentions > 0) {
    topLevelGenres.forEach(genre => {
      genreMap[genre] = Math.min(1, genreMap[genre] / (totalGenreMentions / 4));
    });
  }
  
  return genreMap;
};

const calculateEraBias = (tracks: any[]): Record<string, number> => {
  const eraCounts: Record<string, number> = {
    '2020s': 0,
    '2010s': 0,
    '2000s': 0,
    '1990s': 0,
    '1980s': 0,
    'older': 0
  };
  
  let totalTracks = 0;
  
  tracks.forEach(track => {
    if (track.album && track.album.release_date) {
      const year = parseInt(track.album.release_date.substring(0, 4));
      totalTracks++;
      
      if (year >= 2020) eraCounts['2020s']++;
      else if (year >= 2010) eraCounts['2010s']++;
      else if (year >= 2000) eraCounts['2000s']++;
      else if (year >= 1990) eraCounts['1990s']++;
      else if (year >= 1980) eraCounts['1980s']++;
      else eraCounts['older']++;
    }
  });
  
  // Normalize values
  const result: Record<string, number> = {};
  if (totalTracks > 0) {
    Object.keys(eraCounts).forEach(era => {
      result[era] = eraCounts[era] / totalTracks;
    });
  } else {
    // Default if we couldn't determine years
    Object.keys(eraCounts).forEach(era => {
      result[era] = 0.5;
    });
  }
  
  return result;
};

/**
 * Generate music personality summary for a user
 * @route GET /api/music/summary
 */
export const getMusicSummary = async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userId || req.query.userId as string || '1');
    
    // Check if we already have a recent summary stored
    const existingSummary = await storage.getMusicSummary(userId);
    if (existingSummary) {
      const lastUpdated = existingSummary.lastUpdated ? new Date(existingSummary.lastUpdated) : new Date();
      const now = new Date();
      const hoursSinceUpdate = (now.getTime() - lastUpdated.getTime()) / (1000 * 60 * 60);
      
      // Return existing summary if it's less than 24 hours old
      if (hoursSinceUpdate < 24) {
        console.log(`Using cached music summary for user ${userId}, last updated ${hoursSinceUpdate.toFixed(1)} hours ago`);
        return res.status(200).json(existingSummary);
      }
    }
    
    // Get user for access token
    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(400).json({ 
        message: 'User not found'
      });
    }
    
    if (!user.spotifyId) {
      return res.status(400).json({ 
        message: 'User not authenticated with Spotify'
      });
    }
    
    // Spotify API requires an access token
    const accessToken = user.spotifyAccessToken;
    if (!accessToken) {
      return res.status(401).json({ 
        message: 'Missing Spotify access token',
        error: 'TOKEN_MISSING'
      });
    }
    
    console.log(`Analyzing Spotify music data for user ${userId}`);
    
    // Get user's top artists (short, medium, and long term)
    const [shortTermArtists, mediumTermArtists, longTermArtists] = await Promise.all([
      spotifyApi.getUserTopArtists(accessToken, 'short_term', 50),
      spotifyApi.getUserTopArtists(accessToken, 'medium_term', 50),
      spotifyApi.getUserTopArtists(accessToken, 'long_term', 50)
    ]);
    
    // Get user's top tracks (short, medium, and long term)
    const [shortTermTracks, mediumTermTracks, longTermTracks] = await Promise.all([
      spotifyApi.getUserTopTracks(accessToken, 'short_term', 50),
      spotifyApi.getUserTopTracks(accessToken, 'medium_term', 50),
      spotifyApi.getUserTopTracks(accessToken, 'long_term', 50)
    ]);
    
    // Get user's recently played tracks
    const recentTracks = await spotifyApi.getRecentlyPlayedTracks(accessToken, 50);
    
    // Combine all tracks and get their IDs
    const allTracks = [
      ...(shortTermTracks.items || []),
      ...(mediumTermTracks.items || []),
      ...(longTermTracks.items || [])
    ];
    
    // Get unique track IDs
    const trackIds = [...new Set(allTracks.map(track => track.id))];
    
    // Get audio features for all tracks
    const audioFeatures = await getAudioFeatures(accessToken, trackIds);
    
    // Combine all artists (with deduplication)
    const allArtistsMap = new Map();
    [
      ...(shortTermArtists.items || []),
      ...(mediumTermArtists.items || []),
      ...(longTermArtists.items || [])
    ].forEach(artist => {
      if (!allArtistsMap.has(artist.id)) {
        allArtistsMap.set(artist.id, artist);
      }
    });
    const allArtists = Array.from(allArtistsMap.values());
    
    // Extract recently played artists
    const recentArtists = recentTracks.items
      .map(item => item.track.artists)
      .flat()
      .filter((artist, index, self) => 
        index === self.findIndex(a => a.id === artist.id)
      );
    
    // Generate a music personality summary based on the actual data
    const musicSummary = {
      topArtists: mediumTermArtists.items.map(artist => artist.name).slice(0, 10),
      topTracks: mediumTermTracks.items.map(track => track.name).slice(0, 10),
      topGenres: extractGenres(allArtists),
      recentGenres: extractGenres(recentArtists),
      moodScore: calculateMoodScore(audioFeatures.audio_features),
      genreProfile: generateGenreProfile(allArtists),
      eraBias: calculateEraBias(allTracks)
    };
    
    console.log(`Generated music summary for user ${userId} with ${allArtists.length} artists and ${allTracks.length} tracks`);
    
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
        eraBias: musicSummary.eraBias,
        lastUpdated: new Date()
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
    
    res.status(500).json({ 
      message: 'Error generating music summary',
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
};