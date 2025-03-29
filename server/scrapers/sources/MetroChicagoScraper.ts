import { BaseScraper } from '../BaseScraper';
import { Event } from '@shared/schema';

/**
 * Scraper for Metro Chicago events
 * https://metrochicago.com/shows/
 */
export class MetroChicagoScraper extends BaseScraper {
  constructor() {
    super('MetroChicago', 'https://metrochicago.com/shows/');
  }

  /**
   * Scrape events from Metro Chicago
   */
  public async scrape(): Promise<Omit<Event, 'id'>[]> {
    try {
      console.log(`Starting to scrape ${this.name} events...`);
      this.lastRunTime = new Date();
      
      const html = await this.fetchHtml(this.baseUrl);
      const $ = this.loadCheerio(html);
      const events: Omit<Event, 'id'>[] = [];

      // Metro Chicago coordinates
      const venueLatitude = 41.9470; 
      const venueLongitude = -87.6603;
      
      // Find all event elements on the page
      $('.mec-event-article').each((_, element) => {
        try {
          const name = this.cleanText($(element).find('.mec-event-title').text());
          const dateText = this.cleanText($(element).find('.mec-start-date-label').text());
          const ticketUrl = $(element).find('.mec-booking-button').attr('href') || '';
          const imageUrl = $(element).find('.mec-event-image img').attr('src') || '';
          const description = this.cleanText($(element).find('.mec-event-content p').text());
          
          // Parse the date
          const date = new Date(dateText);
          
          // Generate a unique external ID
          const externalId = `metrochicago-${name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${date.toISOString().split('T')[0]}`;
          
          // Try to extract genre from the description
          const genre = this.extractGenre(description + ' ' + name) || 'Music';
          
          const event: Omit<Event, 'id'> = {
            name,
            venue: 'Metro Chicago',
            date,
            description,
            imageUrl,
            ticketUrl,
            latitude: venueLatitude,
            longitude: venueLongitude,
            genre,
            source: this.name,
            externalId
          };
          
          events.push(event);
        } catch (error) {
          this.logFailure(`Event parsing`, error);
        }
      });
      
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