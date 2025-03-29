import { BaseScraper } from '../BaseScraper';
import { Event } from '@shared/schema';
import { getEnv } from '../../config/env';

/**
 * Scraper for Eventbrite events
 * Uses the Eventbrite API to find music events
 */
export class EventbriteScraper extends BaseScraper {
  private apiKey: string | null;

  constructor() {
    super('Eventbrite', 'https://www.eventbriteapi.com/v3/events/search/');
    
    // Try to get the API key from environment
    try {
      this.apiKey = getEnv('EVENTBRITE_API_KEY', false);
      
      if (!this.apiKey) {
        console.warn('Eventbrite API key not found in environment, scraper will be disabled');
      }
    } catch (error) {
      console.warn('Eventbrite API key not configured, scraper will be disabled');
      this.apiKey = null;
    }
  }

  /**
   * Scrape events from Eventbrite API
   */
  public async scrape(): Promise<Omit<Event, 'id'>[]> {
    if (!this.apiKey) {
      console.warn('Eventbrite scraper disabled due to missing API key');
      return [];
    }

    try {
      console.log(`Starting to scrape ${this.name} events...`);
      this.lastRunTime = new Date();
      
      // Search parameters for Chicago music events
      const params = {
        location: {
          latitude: 41.8781,
          longitude: -87.6298
        },
        categories: '103', // Music category ID
        within: '30mi', // Search radius
        'location.address': 'Chicago, IL',
        expand: 'venue,organizer',
      };
      
      // Build the URL with query parameters
      const url = `${this.baseUrl}?token=${this.apiKey}&location.latitude=${params.location.latitude}&location.longitude=${params.location.longitude}&categories=${params.categories}&within=${params.within}&expand=${params.expand}`;
      
      // Make the API request
      const response = await this.request<any>(url);
      
      if (!response || !response.events) {
        throw new Error('Invalid response from Eventbrite API');
      }
      
      const events: Omit<Event, 'id'>[] = [];
      
      for (const eventData of response.events) {
        try {
          // Extract event information
          const name = eventData.name ? eventData.name.text : 'Unknown Event';
          const description = eventData.description ? eventData.description.text : '';
          const date = new Date(eventData.start.utc);
          const ticketUrl = eventData.url;
          const externalId = `eventbrite-${eventData.id}`;
          
          // Get venue information if available
          let venue = 'Unknown Venue';
          let latitude = null;
          let longitude = null;
          
          if (eventData.venue && eventData.venue.name) {
            venue = eventData.venue.name;
            
            if (eventData.venue.latitude && eventData.venue.longitude) {
              latitude = parseFloat(eventData.venue.latitude);
              longitude = parseFloat(eventData.venue.longitude);
            }
          }
          
          // Get image URL if available
          let imageUrl = '';
          if (eventData.logo && eventData.logo.url) {
            imageUrl = eventData.logo.url;
          }
          
          // Try to extract genre from the description and name
          const genre = this.extractGenre(description + ' ' + name) || 'Music';
          
          const event: Omit<Event, 'id'> = {
            name,
            venue,
            date,
            description,
            imageUrl,
            ticketUrl,
            latitude,
            longitude,
            genre,
            source: this.name,
            externalId
          };
          
          events.push(event);
        } catch (error) {
          this.logFailure(`Event parsing - ${eventData.id || 'unknown'}`, error);
        }
      }
      
      console.log(`Found ${events.length} events from ${this.name}`);
      
      // Save events to database
      await this.saveEvents(events);
      
      this.lastRunSuccess = true;
      return events;
    } catch (error) {
      this.lastRunSuccess = false;
      this.logFailure(this.baseUrl, error);
      throw error;
    }
  }
}