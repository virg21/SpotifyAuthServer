import { Request, Response } from 'express';
import { storage } from '../storage';
import axios from 'axios';
import { getEnv } from '../config/env';

/**
 * Search for music events based on location and user preferences
 * @route GET /api/events
 */
export const getEvents = async (req: Request, res: Response) => {
  try {
    // Extract location from query parameters
    const latitude = parseFloat(req.query.lat as string);
    const longitude = parseFloat(req.query.lng as string);
    const radius = parseInt(req.query.radius as string || '25'); // Default 25km radius
    
    if (isNaN(latitude) || isNaN(longitude)) {
      return res.status(400).json({ 
        message: 'Invalid location parameters. Both lat and lng are required.'
      });
    }
    
    // Get user ID for personalization (if available)
    const userId = req.query.userId ? parseInt(req.query.userId as string) : null;
    let userMusicSummary = null;
    
    if (userId) {
      userMusicSummary = await storage.getMusicSummary(userId);
    }
    
    // First check our local database for events
    const localEvents = await storage.getEvents(latitude, longitude, radius);
    
    // Try to get events from external APIs if configured
    const apiEvents = await fetchExternalEvents(latitude, longitude, radius, userMusicSummary);
    
    // Combine events from all sources
    const allEvents = [...localEvents, ...apiEvents];
    
    // If we have music preferences, sort events by relevance to user's taste
    if (userMusicSummary) {
      // Simple relevance sorting based on genre match
      allEvents.sort((a, b) => {
        const aRelevance = calculateEventRelevance(a, userMusicSummary);
        const bRelevance = calculateEventRelevance(b, userMusicSummary);
        return bRelevance - aRelevance;
      });
    }
    
    res.status(200).json({
      events: allEvents,
      count: allEvents.length,
      location: { latitude, longitude, radius }
    });
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ message: 'Error fetching events' });
  }
};

/**
 * Fetch events from external APIs
 */
async function fetchExternalEvents(latitude: number, longitude: number, radius: number, userMusicSummary: any) {
  const events = [];
  
  // Try Ticketmaster API if key is configured
  const ticketmasterApiKey = getEnv('TICKETMASTER_API_KEY', false);
  if (ticketmasterApiKey) {
    try {
      const response = await axios.get(
        `https://app.ticketmaster.com/discovery/v2/events.json?apikey=${ticketmasterApiKey}&latlong=${latitude},${longitude}&radius=${radius}&size=100&classificationName=music`
      );
      
      if (response.data._embedded && response.data._embedded.events) {
        const ticketmasterEvents = response.data._embedded.events.map((event: any) => {
          const venue = event._embedded.venues[0];
          return {
            id: events.length + 1, // Generate an ID for our database
            name: event.name,
            venue: venue.name,
            date: new Date(event.dates.start.dateTime),
            description: event.info || event.pleaseNote || '',
            imageUrl: event.images.length > 0 ? event.images[0].url : null,
            ticketUrl: event.url,
            latitude: parseFloat(venue.location.latitude),
            longitude: parseFloat(venue.location.longitude),
            genre: event.classifications[0].genre?.name || '',
            source: 'ticketmaster'
          };
        });
        
        events.push(...ticketmasterEvents);
        
        // Save to our database for future requests
        for (const event of ticketmasterEvents) {
          await storage.createEvent(event);
        }
      }
    } catch (error) {
      console.error('Error fetching Ticketmaster events:', error);
    }
  }
  
  // Other APIs can be added here (Eventbrite, Bandsintown, etc.)
  
  return events;
}

/**
 * Calculate relevance score for an event based on user's music taste
 */
function calculateEventRelevance(event: any, musicSummary: any) {
  if (!event.genre || !musicSummary) return 0;
  
  let relevance = 0;
  
  // Check against top genres
  musicSummary.topGenres.forEach((genreInfo: any) => {
    if (event.genre.toLowerCase().includes(genreInfo.genre.toLowerCase())) {
      relevance += genreInfo.count;
    }
  });
  
  // Check against genre profile categories
  const genre = event.genre.toLowerCase();
  
  if (genre.includes('electronic') || genre.includes('edm') || genre.includes('techno')) {
    relevance += musicSummary.genreProfile.electronic / 10;
  } else if (genre.includes('rock') || genre.includes('alternative') || genre.includes('metal')) {
    relevance += musicSummary.genreProfile.rock / 10;
  } else if (genre.includes('hip') || genre.includes('rap') || genre.includes('r&b')) {
    relevance += musicSummary.genreProfile.hiphop / 10;
  } else if (genre.includes('pop')) {
    relevance += musicSummary.genreProfile.pop / 10;
  } else if (genre.includes('jazz') || genre.includes('blues') || genre.includes('soul')) {
    relevance += musicSummary.genreProfile.jazz / 10;
  } else if (genre.includes('folk') || genre.includes('acoustic')) {
    relevance += musicSummary.genreProfile.folk / 10;
  } else if (genre.includes('classical') || genre.includes('orchestra')) {
    relevance += musicSummary.genreProfile.classical / 10;
  } else if (genre.includes('world') || genre.includes('latin') || genre.includes('reggae')) {
    relevance += musicSummary.genreProfile.world / 10;
  }
  
  return relevance;
}