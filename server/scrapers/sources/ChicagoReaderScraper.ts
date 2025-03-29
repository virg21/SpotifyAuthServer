import { BaseScraper } from '../BaseScraper';
import { Event } from '@shared/schema';

/**
 * Scraper for Chicago Reader website
 * Source: https://www.chicagoreader.com/music
 */
export class ChicagoReaderScraper extends BaseScraper {
  constructor() {
    super('Chicago Reader', 'https://www.chicagoreader.com');
  }

  /**
   * Scrape Chicago Reader for music events
   */
  async scrape(): Promise<Omit<Event, 'id'>[]> {
    try {
      console.log(`Starting to scrape ${this.name}...`);
      this.events = [];

      // Target URL with music events
      const targetUrl = `${this.baseUrl}/chicago/EventSearch?eventSection=1063834&narrowByDate=Today&sortType=date`;
      const html = await this.fetchHtml(targetUrl);
      const $ = this.loadCheerio(html);

      // Process each event on the page
      $('.event-row').each((_, element) => {
        try {
          // Extract basic data
          const title = this.cleanText($(element).find('.event-title').text());
          const detailLink = $(element).find('.event-title a').attr('href') || '';
          const eventUrl = detailLink.startsWith('http') ? detailLink : `${this.baseUrl}${detailLink}`;
          
          // Extract date, time, and venue info
          const dateText = this.cleanText($(element).find('.event-date').text());
          const timeText = this.cleanText($(element).find('.event-time').text());
          const venueText = this.cleanText($(element).find('.event-location').text());
          
          // Parse the date
          const date = this.parseChicagoReaderDate(dateText, timeText);
          
          // Try to extract genre from the event details
          const descriptionText = this.cleanText($(element).find('.event-details').text());
          const genre = this.extractGenre(descriptionText || title);

          // Create event object
          const event: Omit<Event, 'id'> = {
            name: title,
            venue: venueText,
            date,
            description: descriptionText || null,
            imageUrl: null,
            ticketUrl: eventUrl,
            latitude: null,
            longitude: null,
            genre: genre || null,
            source: this.name,
            externalId: `chicago-reader-${Buffer.from(eventUrl).toString('base64')}`,
          };

          this.events.push(event);
        } catch (error) {
          console.error(`Error processing Chicago Reader event:`, error);
        }
      });

      console.log(`Found ${this.events.length} events on Chicago Reader`);
      
      // Save events to storage
      await this.saveEvents(this.events);
      
      return this.events;
    } catch (error) {
      this.logFailure(this.baseUrl, error);
      return [];
    }
  }

  /**
   * Parse Chicago Reader specific date format
   */
  private parseChicagoReaderDate(dateStr: string, timeStr: string): Date {
    try {
      // Example formats: "Tuesday, April 12" and "8:00 PM"
      const currentYear = new Date().getFullYear();
      const dateWithYear = `${dateStr}, ${currentYear}`;
      
      // Combine date and time
      const dateTimeStr = `${dateWithYear} ${timeStr}`;
      return new Date(dateTimeStr);
    } catch (error) {
      console.error(`Error parsing Chicago Reader date: ${dateStr} ${timeStr}`, error);
      return new Date();
    }
  }
}