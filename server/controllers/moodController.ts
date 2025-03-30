import { Request, Response } from 'express';
import { storage } from '../storage';

// Define available mood categories
export enum MoodCategory {
  ENERGETIC = 'energetic',
  RELAXED = 'relaxed',
  UPBEAT = 'upbeat',
  MELANCHOLIC = 'melancholic',
  PARTY = 'party',
  FOCUSED = 'focused',
  ROMANTIC = 'romantic'
}

// Define keywords associated with each mood
const moodKeywords: Record<MoodCategory, string[]> = {
  [MoodCategory.ENERGETIC]: ['rock', 'electronic', 'dance', 'edm', 'pop', 'upbeat', 'party', 'hip-hop', 'rap'],
  [MoodCategory.RELAXED]: ['jazz', 'ambient', 'acoustic', 'folk', 'indie', 'chill', 'classical'],
  [MoodCategory.UPBEAT]: ['pop', 'dance', 'funk', 'disco', 'tropical', 'summer', 'happy'],
  [MoodCategory.MELANCHOLIC]: ['indie', 'alternative', 'folk', 'singer-songwriter', 'soul', 'blues'],
  [MoodCategory.PARTY]: ['electronic', 'dance', 'hip-hop', 'rap', 'r&b', 'latin', 'reggaeton'],
  [MoodCategory.FOCUSED]: ['classical', 'instrumental', 'ambient', 'study', 'concentration', 'piano'],
  [MoodCategory.ROMANTIC]: ['r&b', 'soul', 'jazz', 'ballad', 'acoustic', 'love']
};

// Map moods to genres
const moodToGenreMapping: Record<MoodCategory, string[]> = {
  [MoodCategory.ENERGETIC]: ['rock', 'electronic', 'dance', 'hip-hop'],
  [MoodCategory.RELAXED]: ['jazz', 'ambient', 'acoustic', 'folk', 'classical'],
  [MoodCategory.UPBEAT]: ['pop', 'funk', 'disco'],
  [MoodCategory.MELANCHOLIC]: ['indie', 'alternative', 'folk', 'soul', 'blues'],
  [MoodCategory.PARTY]: ['electronic', 'dance', 'hip-hop', 'r&b', 'latin'],
  [MoodCategory.FOCUSED]: ['classical', 'ambient', 'instrumental'],
  [MoodCategory.ROMANTIC]: ['r&b', 'soul', 'jazz']
};

/**
 * Calculate how well an event matches a given mood
 * @param eventDescription Combined event details (name, description, genre)
 * @param mood The mood to match against
 * @returns Score between 0-1 indicating relevance
 */
function calculateMoodRelevance(eventDescription: string, mood: MoodCategory): number {
  const keywords = moodKeywords[mood];
  let matchCount = 0;
  
  // Case insensitive check for each keyword
  keywords.forEach(keyword => {
    if (eventDescription.toLowerCase().includes(keyword.toLowerCase())) {
      matchCount++;
    }
  });
  
  // Calculate relevance score (0-1)
  return matchCount > 0 ? Math.min(matchCount / 3, 1) : 0;
}

/**
 * Get events recommendations based on user's mood
 * @route GET /api/recommendations/mood/:mood
 */
export const getMoodBasedEvents = async (req: Request, res: Response) => {
  try {
    const { mood } = req.params;
    
    // Validate mood parameter
    if (!Object.values(MoodCategory).includes(mood as MoodCategory)) {
      return res.status(400).json({
        message: 'Invalid mood parameter',
        validMoods: Object.values(MoodCategory)
      });
    }
    
    // Get user's location from query or default to Chicago
    const latitude = parseFloat(req.query.latitude as string) || 41.8781;
    const longitude = parseFloat(req.query.longitude as string) || -87.6298;
    const radius = parseInt(req.query.radius as string) || 25; // miles
    
    // Get all events within radius
    const events = await storage.getEvents(latitude, longitude, radius);
    
    // Filter and sort events by mood relevance
    const relevantEvents = events.map(event => {
      // Combine relevant text fields for matching
      const eventDescription = `${event.name} ${event.description || ''} ${event.genre || ''}`;
      
      // Calculate relevance score for this mood
      const relevanceScore = calculateMoodRelevance(eventDescription, mood as MoodCategory);
      
      return {
        ...event,
        relevanceScore
      };
    })
    .filter(event => event.relevanceScore > 0)
    .sort((a, b) => b.relevanceScore - a.relevanceScore);
    
    return res.status(200).json({
      mood,
      count: relevantEvents.length,
      events: relevantEvents
    });
  } catch (error) {
    console.error('Error getting mood-based recommendations:', error);
    return res.status(500).json({ 
      message: 'Error getting mood-based recommendations',
      error: (error as Error).message
    });
  }
};

/**
 * Get all available moods
 * @route GET /api/recommendations/moods
 */
export const getAvailableMoods = (_req: Request, res: Response) => {
  try {
    const moods = Object.values(MoodCategory).map(mood => ({
      id: mood,
      name: mood.charAt(0).toUpperCase() + mood.slice(1),
      keywords: moodKeywords[mood as MoodCategory].join(', ')
    }));
    
    return res.status(200).json({
      count: moods.length,
      moods
    });
  } catch (error) {
    console.error('Error getting available moods:', error);
    return res.status(500).json({ 
      message: 'Error getting available moods',
      error: (error as Error).message
    });
  }
};

/**
 * Get events by genre
 * @route GET /api/recommendations/genre/:genre
 */
export const getEventsByGenre = async (req: Request, res: Response) => {
  try {
    const { genre } = req.params;
    
    if (!genre) {
      return res.status(400).json({ message: 'Genre parameter is required' });
    }
    
    const events = await storage.getEventsByGenre(genre);
    
    return res.status(200).json({
      genre,
      count: events.length,
      events
    });
  } catch (error) {
    console.error('Error getting genre-based events:', error);
    return res.status(500).json({ 
      message: 'Error getting genre-based events',
      error: (error as Error).message
    });
  }
};

/**
 * Get mood recommendations based on user's music summary
 * @route GET /api/recommendations/personal
 */
export const getPersonalizedMoodRecommendations = async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.query.userId as string);
    
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }
    
    // Get user's music summary
    const musicSummary = await storage.getMusicSummary(userId);
    
    if (!musicSummary) {
      return res.status(404).json({ message: 'Music summary not found for user' });
    }
    
    // Extract genres from music summary
    const topGenres = Array.isArray(musicSummary.topGenres) ? musicSummary.topGenres : [];
    const recentGenres = Array.isArray(musicSummary.recentGenres) ? musicSummary.recentGenres : [];
    
    // Get just the genre names from the objects
    const userGenreStrings = [
      ...topGenres.map(g => g.genre?.toLowerCase() || ''),
      ...recentGenres.map(g => g.genre?.toLowerCase() || '')
    ].filter(genre => genre !== '');
    
    // Map user genres to moods 
    const userMoods: MoodCategory[] = [];
    
    Object.entries(moodToGenreMapping).forEach(([mood, genres]) => {
      // Check if user genres overlap with this mood's genres
      const hasMatchingGenres = genres.some(genre => 
        userGenreStrings.some(userGenre => 
          userGenre.includes(genre.toLowerCase()) || 
          genre.toLowerCase().includes(userGenre)
        )
      );
      
      if (hasMatchingGenres && !userMoods.includes(mood as MoodCategory)) {
        userMoods.push(mood as MoodCategory);
      }
    });
    
    // Get events for each identified mood
    const recommendations: Record<string, any[]> = {};
    
    // Get user's location
    const user = await storage.getUser(userId);
    const latitude = user?.latitude || 41.8781;
    const longitude = user?.longitude || -87.6298;
    const radius = 25; // miles
    
    // Get all events within radius
    const allEvents = await storage.getEvents(latitude, longitude, radius);
    
    // Process each identified mood
    userMoods.forEach(mood => {
      // Filter and score events for this mood
      const moodEvents = allEvents.map(event => {
        const eventDescription = `${event.name} ${event.description || ''} ${event.genre || ''}`;
        const relevanceScore = calculateMoodRelevance(eventDescription, mood);
        
        return {
          ...event,
          relevanceScore
        };
      })
      .filter(event => event.relevanceScore > 0)
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, 5); // Top 5 events for each mood
      
      if (moodEvents.length > 0) {
        recommendations[mood] = moodEvents;
      }
    });
    
    return res.status(200).json({
      userId,
      recommendedMoods: userMoods,
      recommendations
    });
  } catch (error) {
    console.error('Error getting personalized mood recommendations:', error);
    return res.status(500).json({ 
      message: 'Error getting personalized mood recommendations',
      error: (error as Error).message
    });
  }
};