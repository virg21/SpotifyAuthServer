import { BaseScraper } from '../BaseScraper';
import { Event } from '@shared/schema';

/**
 * Scraper for Do312 website
 * Source: https://do312.com
 */
export class Do312Scraper extends BaseScraper {
  constructor() {
    super('Do312', 'https://do312.com');
  }

  /**
   * Scrape Do312 for music events in Chicago
   */
  async scrape(): Promise<Omit<Event, 'id'>[]> {
    try {
      console.log(`Starting to scrape ${this.name}...`);
      this.events = [];

      // Target URL with music events in Chicago
      const targetUrl = `${this.baseUrl}/events/music`;
      const html = await this.fetchHtml(targetUrl);
      const $ = this.loadCheerio(html);

      // Process each event on the page
      $('.ds-listing-event-title').each((_, element) => {
        try {
          // Extract basic data
          const title = this.cleanText($(element).text());
          const detailLink = $(element).find('a').attr('href') || '';
          const eventUrl = detailLink.startsWith('http') ? detailLink : `${this.baseUrl}${detailLink}`;
          
          // Extract date and venue from parent elements
          const eventItem = $(element).closest('.ds-listing');
          const dateText = this.cleanText($(eventItem).find('.ds-listing-event-date').text());
          const venueText = this.cleanText($(eventItem).find('.ds-venue-name').text());

          // Extract image if available
          const imageUrl = $(eventItem).find('img').attr('src') || undefined;
          
          // Parse the date
          const date = this.parseDo312Date(dateText);
          
          // Extract genre if it exists in the title or tags
          const genreText = $(eventItem).find('.ds-event-category').text();
          const genre = this.extractGenre(genreText || title);

          // Create event object
          const event: Omit<Event, 'id'> = {
            name: title,
            venue: venueText,
            date,
            description: null, // Would need to visit detail page to get this
            imageUrl: imageUrl || null,
            ticketUrl: eventUrl,
            latitude: null, // Would need geocoding service to get coordinates
            longitude: null,
            genre: genre || null,
            source: this.name,
            externalId: `do312-${Buffer.from(eventUrl).toString('base64')}`,
          };

          this.events.push(event);
        } catch (error) {
          console.error(`Error processing Do312 event:`, error);
        }
      });

      console.log(`Found ${this.events.length} events on Do312`);
      
      // Save events to storage
      await this.saveEvents(this.events);
      
      return this.events;
    } catch (error) {
      this.logFailure(this.baseUrl, error);
      return [];
    }
  }

  /**
   * Parse Do312 specific date format
   */
  private parseDo312Date(dateStr: string): Date {
    try {
      // Example format: "Tuesday, Apr 12, 2022"
      const dateParts = dateStr.split(',').map(part => part.trim());
      if (dateParts.length >= 2) {
        // Add current year if not present
        if (dateParts.length === 2) {
          dateParts.push(new Date().getFullYear().toString());
        }
        return new Date(dateParts.slice(1).join(', '));
      }
      return new Date();
    } catch (error) {
      console.error(`Error parsing Do312 date: ${dateStr}`, error);
      return new Date();
    }
  }
}