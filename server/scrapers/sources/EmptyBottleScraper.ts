import { BaseScraper } from '../BaseScraper';
import { Event } from '@shared/schema';

/**
 * Scraper for Empty Bottle venue website
 * Source: https://www.emptybottle.com
 */
export class EmptyBottleScraper extends BaseScraper {
  constructor() {
    super('Empty Bottle', 'https://www.emptybottle.com');
  }

  /**
   * Scrape Empty Bottle for music events
   */
  async scrape(): Promise<Omit<Event, 'id'>[]> {
    try {
      console.log(`Starting to scrape ${this.name}...`);
      this.events = [];

      // Empty Bottle lists events on their calendar page
      const targetUrl = `${this.baseUrl}/events/`;
      const html = await this.fetchHtml(targetUrl);
      const $ = this.loadCheerio(html);

      // Venue coordinates (fixed for Empty Bottle)
      const venueLat = 41.900271;
      const venueLng = -87.686584;

      // Process each event on the page
      $('.show-card').each((_, element) => {
        try {
          // Extract basic data
          const title = this.cleanText($(element).find('.show-title').text());
          const detailLink = $(element).find('a.show-header-link').attr('href') || '';
          const eventUrl = detailLink.startsWith('http') ? detailLink : `${this.baseUrl}${detailLink}`;
          
          // Extract date information
          const dateText = this.cleanText($(element).find('.show-date').text());
          const timeText = this.cleanText($(element).find('.show-time').text());
          
          // Extract image if available
          const imageUrl = $(element).find('.show-img img').attr('src') || undefined;
          
          // Extract details
          const descriptionText = this.cleanText($(element).find('.show-details p').text());
          
          // Get ticket link
          const ticketUrl = $(element).find('.show-links a.show-tickets').attr('href') || eventUrl;
          
          // Determine the date
          const date = new Date();
          if (dateText) {
            // Format is typically "MONTH DD" (e.g., "APRIL 15")
            const currentYear = new Date().getFullYear();
            const monthDay = dateText.trim();
            date.setFullYear(currentYear);
            
            // Parse month and day
            const parts = monthDay.split(' ');
            if (parts.length === 2) {
              const month = this.getMonthNumber(parts[0]);
              const day = parseInt(parts[1], 10);
              
              if (!isNaN(month) && !isNaN(day)) {
                date.setMonth(month - 1);
                date.setDate(day);
                
                // If time is available, set the hours and minutes
                if (timeText) {
                  // Format is typically "DOORS: 7:30PM, SHOW: 8:30PM"
                  const timeParts = timeText.includes('SHOW:')
                    ? timeText.split('SHOW:')[1].trim()
                    : timeText.split('DOORS:')[1].trim();
                    
                  if (timeParts) {
                    const timeMatch = timeParts.match(/(\d+):(\d+)([AP]M)/i);
                    if (timeMatch) {
                      let hours = parseInt(timeMatch[1], 10);
                      const minutes = parseInt(timeMatch[2], 10);
                      const isPM = timeMatch[3].toUpperCase() === 'PM';
                      
                      if (isPM && hours < 12) hours += 12;
                      if (!isPM && hours === 12) hours = 0;
                      
                      date.setHours(hours, minutes, 0, 0);
                    }
                  }
                }
              }
            }
          }
          
          // Try to extract genre from the title or description
          const genre = this.extractGenre(title) || this.extractGenre(descriptionText) || undefined;

          // Create event object
          const event: Omit<Event, 'id'> = {
            name: title,
            venue: 'Empty Bottle',
            date,
            description: descriptionText || null,
            imageUrl: imageUrl || null,
            ticketUrl,
            latitude: venueLat,
            longitude: venueLng,
            genre: genre || null,
            source: this.name,
            externalId: `empty-bottle-${Buffer.from(eventUrl).toString('base64')}`,
          };

          this.events.push(event);
        } catch (error) {
          console.error(`Error processing Empty Bottle event:`, error);
        }
      });

      console.log(`Found ${this.events.length} events at Empty Bottle`);
      
      // Save events to storage
      await this.saveEvents(this.events);
      
      return this.events;
    } catch (error) {
      this.logFailure(this.baseUrl, error);
      return [];
    }
  }

  /**
   * Helper method to convert month name to number
   */
  private getMonthNumber(month: string): number {
    const months: {[key: string]: number} = {
      'JAN': 1, 'JANUARY': 1,
      'FEB': 2, 'FEBRUARY': 2,
      'MAR': 3, 'MARCH': 3,
      'APR': 4, 'APRIL': 4,
      'MAY': 5,
      'JUN': 6, 'JUNE': 6,
      'JUL': 7, 'JULY': 7,
      'AUG': 8, 'AUGUST': 8,
      'SEP': 9, 'SEPTEMBER': 9,
      'OCT': 10, 'OCTOBER': 10,
      'NOV': 11, 'NOVEMBER': 11,
      'DEC': 12, 'DECEMBER': 12
    };
    
    return months[month.trim().toUpperCase()] || 0;
  }
}