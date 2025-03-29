import { Request, Response } from 'express';
import { storage } from '../storage';
import { eventScraperManager } from '../scrapers/EventScraperManager';
import { z } from 'zod';

const eventQuerySchema = z.object({
  lat: z.coerce.number().min(-90).max(90),
  lng: z.coerce.number().min(-180).max(180),
  radius: z.coerce.number().default(10),
  userId: z.coerce.number().optional(),
});

/**
 * Search for music events based on location and user preferences
 * @route GET /api/events
 */
export const getEvents = async (req: Request, res: Response) => {
  try {
    // If no query parameters, return all events
    if (!req.query.lat && !req.query.lng) {
      const allEvents = await storage.getAllEvents();
      // Sort events by date
      const sortedEvents = allEvents.sort((a, b) => a.date.getTime() - b.date.getTime());
      
      return res.json({
        success: true,
        count: sortedEvents.length,
        events: sortedEvents
      });
    }
    
    const queryResult = eventQuerySchema.safeParse(req.query);
    
    if (!queryResult.success) {
      return res.status(400).json({
        success: false,
        message: 'Invalid query parameters',
        errors: queryResult.error.errors
      });
    }
    
    const { lat, lng, radius, userId } = queryResult.data;
    
    // Fetch events based on location
    const events = await storage.getEvents(lat, lng, radius);
    
    if (userId) {
      // If we have a user ID, get their music summary to personalize results
      const musicSummary = await storage.getMusicSummary(userId);
      
      if (musicSummary) {
        // Sort events by relevance to user's music preferences
        const sortedEvents = events.map(event => {
          const relevanceScore = calculateEventRelevance(event, musicSummary);
          return { ...event, relevanceScore };
        }).sort((a, b) => b.relevanceScore - a.relevanceScore);
        
        return res.json({
          success: true,
          count: sortedEvents.length,
          events: sortedEvents
        });
      }
    }
    
    // If no user ID or no music summary, return events sorted by date
    const sortedEvents = events.sort((a, b) => a.date.getTime() - b.date.getTime());
    
    return res.json({
      success: true,
      count: sortedEvents.length,
      events: sortedEvents
    });
  } catch (error) {
    console.error('Error fetching events:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch events',
      error: (error as Error).message
    });
  }
};

/**
 * Create a test event
 * @route POST /api/events/test
 */
export const createTestEvent = async (req: Request, res: Response) => {
  try {
    const now = new Date();
    const testEvent = {
      name: `Test Event ${now.toISOString()}`,
      venue: 'Test Venue',
      date: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000), // One week from now
      description: 'This is a test event created for testing purposes',
      imageUrl: 'https://via.placeholder.com/300',
      ticketUrl: 'https://example.com/tickets',
      latitude: 41.8781,
      longitude: -87.6298,
      genre: 'Rock',
      source: 'Test',
      externalId: `test-${Date.now()}`
    };
    
    const createdEvent = await storage.createEvent(testEvent);
    
    return res.status(201).json({
      success: true,
      message: 'Test event created successfully',
      event: createdEvent
    });
  } catch (error) {
    console.error('Error creating test event:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create test event',
      error: (error as Error).message
    });
  }
};

/**
 * Endpoint to manually trigger event scraping
 * @route POST /api/events/scrape
 * @access Admin only
 */
export const triggerScraping = async (_req: Request, res: Response) => {
  try {
    // Start the scraping process
    eventScraperManager.runAllScrapers().catch(error => {
      console.error('Error during scraping:', error);
    });
    
    return res.json({
      success: true,
      message: 'Event scraping process started. This will run in the background.'
    });
  } catch (error) {
    console.error('Error triggering scraping:', error);
    return res.status(500).json({
      success: false, 
      message: 'Failed to start scraping process',
      error: (error as Error).message
    });
  }
};

/**
 * Get scraper status
 * @route GET /api/events/scrape/status
 * @access Admin only
 */
export const getScraperStatus = (_req: Request, res: Response) => {
  try {
    const status = eventScraperManager.getStatus();
    
    return res.json({
      success: true,
      status
    });
  } catch (error) {
    console.error('Error getting scraper status:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get scraper status',
      error: (error as Error).message
    });
  }
};

/**
 * Calculate relevance score for an event based on user's music taste
 */
function calculateEventRelevance(event: any, musicSummary: any): number {
  let score = 0;
  
  // Base score of 1 for all events
  score += 1;
  
  // Give higher scores based on genre match
  if (event.genre && musicSummary.topGenres) {
    const eventGenre = event.genre.toLowerCase();
    const userGenres = musicSummary.topGenres as { genre: string, count: number }[];
    
    for (const genreData of userGenres) {
      if (eventGenre.includes(genreData.genre.toLowerCase())) {
        // Higher score for more preferred genres (those with higher counts)
        score += 3 * (genreData.count / 10);
        break;
      }
    }
  }
  
  // Check if event artists match user's top artists
  if (event.name && musicSummary.topArtists) {
    const eventName = event.name.toLowerCase();
    const userArtists = musicSummary.topArtists as { name: string, count: number }[];
    
    for (const artistData of userArtists) {
      if (eventName.includes(artistData.name.toLowerCase())) {
        // Direct artist match is a strong signal
        score += 5 * (artistData.count / 10);
        break;
      }
    }
  }
  
  return score;
}