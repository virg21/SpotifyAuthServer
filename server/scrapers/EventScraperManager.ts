import * as cron from 'node-cron';
import { BaseScraper } from './BaseScraper';

// Importing all available scrapers
// Note: You'll need to create these scraper classes as needed
import { MetroChicagoScraper } from './sources/MetroChicagoScraper.js';
import { EventbriteScraper } from './sources/EventbriteScraper.js';
import { BandsInTownScraper } from './sources/BandsInTownScraper.js';

/**
 * Manages all event scrapers and schedules their execution
 */
export class EventScraperManager {
  private scrapers: BaseScraper[] = [];
  private isRunning: boolean = false;
  private lastRunTime: Date | null = null;
  private lastRunSuccess: boolean = false;
  private cronJob: cron.ScheduledTask | null = null;
  
  constructor() {
    this.initializeScrapers();
    this.setupCronJob();
  }
  
  /**
   * Initialize all available scrapers
   */
  private initializeScrapers(): void {
    // Add all scrapers to the list
    this.scrapers = [
      new MetroChicagoScraper(),
      new EventbriteScraper(),
      new BandsInTownScraper(),
    ];
    
    console.log(`EventScraperManager initialized with ${this.scrapers.length} scrapers`);
  }
  
  /**
   * Setup the cron job to run scrapers daily at 3 AM
   */
  private setupCronJob(): void {
    try {
      // Run at 3 AM every day
      this.cronJob = cron.schedule('0 3 * * *', () => {
        console.log('Running scheduled event scraping...');
        this.runAllScrapers().catch(error => {
          console.error('Error during scheduled scraping:', error);
        });
      });
      
      console.log('Event scraping scheduled successfully');
    } catch (error) {
      console.error('Failed to schedule event scraping:', error);
    }
  }
  
  /**
   * Run all scrapers one by one
   */
  public async runAllScrapers(): Promise<void> {
    if (this.isRunning) {
      console.log('Scraping already in progress, skipping...');
      return;
    }
    
    this.isRunning = true;
    this.lastRunSuccess = false;
    
    try {
      console.log('Starting to run all scrapers...');
      
      for (const scraper of this.scrapers) {
        try {
          console.log(`Running scraper: ${scraper.name}`);
          await scraper.scrape();
          console.log(`Finished scraper: ${scraper.name}`);
        } catch (error) {
          console.error(`Error running scraper ${scraper.name}:`, error);
        }
      }
      
      this.lastRunSuccess = true;
      console.log('All scrapers completed successfully');
    } catch (error) {
      console.error('Error running scrapers:', error);
      this.lastRunSuccess = false;
    } finally {
      this.lastRunTime = new Date();
      this.isRunning = false;
    }
  }
  
  /**
   * Get the status of the scraper manager
   */
  public getStatus(): any {
    return {
      isRunning: this.isRunning,
      scraperCount: this.scrapers.length,
      scrapers: this.scrapers.map(s => ({
        name: s.name,
        lastRunTime: s.lastRunTime,
        lastRunSuccess: s.lastRunSuccess,
        errorCount: s.errorCount
      })),
      lastRunTime: this.lastRunTime,
      lastRunSuccess: this.lastRunSuccess,
      cronSchedule: this.cronJob ? 'Active (daily at 3 AM)' : 'Not scheduled'
    };
  }
  
  /**
   * Stop the cron job
   */
  public stop(): void {
    if (this.cronJob) {
      this.cronJob.stop();
      console.log('Event scraper scheduling stopped');
    }
  }
}

// Export singleton instance
export const eventScraperManager = new EventScraperManager();