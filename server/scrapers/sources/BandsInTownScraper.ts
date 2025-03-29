import { BaseScraper } from '../BaseScraper';
import { Event } from '@shared/schema';
import { getEnv } from '../../config/env';

/**
 * Scraper for BandsInTown events
 * Uses the BandsInTown API to find music events for a location
 */
export class BandsInTownScraper extends BaseScraper {
  private appId: string | null;
  private readonly ARTISTS_TO_CHECK: string[] = [
    'Taylor Swift', 'Drake', 'Billie Eilish', 'The Weeknd', 'Post Malone',
    'Dua Lipa', 'Harry Styles', 'Bad Bunny', 'Ariana Grande', 'BTS',
    'Lady Gaga', 'Kendrick Lamar', 'Ed Sheeran', 'Doja Cat', 'Beyoncé',
    'Justin Bieber', 'Travis Scott', 'Megan Thee Stallion', 'Olivia Rodrigo', 'Lil Nas X',
    'Adele', 'Coldplay', 'J Balvin', 'Cardi B', 'Bruno Mars',
    // Add local Chicago artists
    'Chance the Rapper', 'Kanye West', 'Common', 'Lupe Fiasco', 'Earth, Wind & Fire',
    'Smashing Pumpkins', 'Fall Out Boy', 'Wilco', 'Twista', 'Chief Keef'
  ];

  constructor() {
    super('BandsInTown', 'https://rest.bandsintown.com/artists/');
    
    // Try to get the API key from environment
    try {
      this.appId = getEnv('BANDSINTOWN_APP_ID', false);
      
      if (!this.appId) {
        console.warn('BandsInTown App ID not found in environment, scraper will be disabled');
      }
    } catch (error) {
      console.warn('BandsInTown App ID not configured, scraper will be disabled');
      this.appId = null;
    }
  }

  /**
   * Scrape events from BandsInTown API for multiple artists
   */
  public async scrape(): Promise<Omit<Event, 'id'>[]> {
    if (!this.appId) {
      console.warn('BandsInTown scraper disabled due to missing App ID');
      return [];
    }

    try {
      console.log(`Starting to scrape ${this.name} events...`);
      this.lastRunTime = new Date();
      
      const allEvents: Omit<Event, 'id'>[] = [];
      
      // Go through each artist and get their events
      for (const artist of this.ARTISTS_TO_CHECK) {
        try {
          const events = await this.scrapeArtistEvents(artist);
          allEvents.push(...events);
        } catch (error) {
          this.logFailure(`Artist: ${artist}`, error);
        }
      }
      
      console.log(`Found ${allEvents.length} events from ${this.name}`);
      
      // Save events to database
      await this.saveEvents(allEvents);
      
      this.lastRunSuccess = true;
      return allEvents;
    } catch (error) {
      this.lastRunSuccess = false;
      this.logFailure(this.baseUrl, error);
      throw error;
    }
  }
  
  /**
   * Scrape events for a specific artist
   * @param artist Artist name
   */
  private async scrapeArtistEvents(artist: string): Promise<Omit<Event, 'id'>[]> {
    try {
      // Encode artist name for URL
      const encodedArtist = encodeURIComponent(artist);
      
      // Get events for the artist
      const url = `${this.baseUrl}${encodedArtist}/events?app_id=${this.appId}&date=upcoming`;
      const events = await this.request<any[]>(url);
      
      if (!events || !Array.isArray(events)) {
        return [];
      }
      
      // Filter events to those in Chicago area (within 50 miles)
      const chicagoLat = 41.8781;
      const chicagoLng = -87.6298;
      const chicagoEvents = events.filter(event => {
        if (event.venue && event.venue.latitude && event.venue.longitude) {
          const distance = this.getDistanceFromLatLng(
            chicagoLat, 
            chicagoLng, 
            event.venue.latitude, 
            event.venue.longitude
          );
          
          // Within 50 miles (80.47 km)
          return distance <= 80.47;
        }
        
        return false;
      });
      
      // Transform BandsInTown events to our event model
      return chicagoEvents.map(eventData => {
        const venue = eventData.venue ? eventData.venue.name : 'Unknown Venue';
        const latitude = eventData.venue ? eventData.venue.latitude : null;
        const longitude = eventData.venue ? eventData.venue.longitude : null;
        const date = new Date(eventData.datetime);
        const ticketUrl = eventData.url || '';
        const description = `${artist} performing at ${venue}`;
        const externalId = `bandsintown-${eventData.id}`;
        
        // Try to get an image for the artist
        const imageUrl = eventData.artist && eventData.artist.image_url ? eventData.artist.image_url : '';
        
        return {
          name: `${artist} Concert`,
          venue,
          date,
          description,
          imageUrl,
          ticketUrl,
          latitude,
          longitude,
          genre: this.extractGenre(description) || 'Music',
          source: this.name,
          externalId
        };
      });
    } catch (error) {
      this.logFailure(`Artist: ${artist}`, error);
      return [];
    }
  }
}