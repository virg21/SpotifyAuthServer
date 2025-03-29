import { storage } from '../storage';
import { Event } from '@shared/schema';
import axios from 'axios';
import * as cheerio from 'cheerio';

/**
 * Base class for all event scrapers
 * Provides common functionality and interface for scraping events
 */
export abstract class BaseScraper {
  public readonly name: string;
  public readonly baseUrl: string;
  public lastRunTime: Date | null = null;
  public lastRunSuccess: boolean = false;
  public errorCount: number = 0;
  protected events: Omit<Event, 'id'>[] = [];
  protected errors: Error[] = [];
  
  constructor(name: string, baseUrl: string) {
    this.name = name;
    this.baseUrl = baseUrl;
  }
  
  /**
   * Abstract method that must be implemented by each scraper
   * This is where the actual scraping logic goes
   */
  public abstract scrape(): Promise<Omit<Event, 'id'>[]>;
  
  /**
   * Save events to storage
   * @param events Array of events to save
   */
  protected async saveEvents(events: Omit<Event, 'id'>[]): Promise<void> {
    for (const event of events) {
      try {
        // Check if event already exists based on externalId
        const existingEvent = event.externalId ? 
          await storage.getEventByExternalId(event.externalId) : 
          undefined;
        
        if (existingEvent) {
          // Update existing event
          await storage.updateEvent(existingEvent.id, event);
        } else {
          // Create new event
          await storage.createEvent(event);
        }
      } catch (error) {
        console.error(`Error saving event from ${this.name}:`, error);
        this.logFailure(`saveEvent - ${event.name}`, error);
      }
    }
  }
  
  /**
   * Make an HTTP request with error handling
   * @param url URL to request
   * @param options Axios request options
   */
  protected async request<T>(url: string, options?: any): Promise<T> {
    try {
      const response = await axios({
        url,
        timeout: 30000, // 30 seconds timeout
        ...options
      });
      
      return response.data;
    } catch (error) {
      this.logFailure(url, error);
      throw error;
    }
  }
  
  /**
   * Log a scraping failure
   * @param url URL that failed
   * @param error Error object
   */
  protected logFailure(url: string, error: any): void {
    this.errorCount++;
    this.errors.push(new Error(`${this.name} scraper error on ${url}: ${error.message}`));
    console.error(`${this.name} scraper error on ${url}:`, error);
  }
  
  /**
   * Calculate distance between two lat/lng coordinates in km using Haversine formula
   * @param lat1 Latitude of first point
   * @param lng1 Longitude of first point
   * @param lat2 Latitude of second point
   * @param lng2 Longitude of second point
   */
  protected getDistanceFromLatLng(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371; // Radius of the earth in km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lng2 - lng1); 
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2)
    ; 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    const d = R * c; // Distance in km
    return d;
  }
  
  /**
   * Convert degrees to radians
   * @param deg Degrees
   */
  private deg2rad(deg: number): number {
    return deg * (Math.PI/180);
  }
  
  /**
   * Extract genre from text
   * @param text Text to analyze
   */
  protected extractGenre(text: string): string | undefined {
    const genreKeywords = [
      'rock', 'indie', 'pop', 'electronic', 'jazz', 'blues', 'hip hop', 
      'rap', 'metal', 'punk', 'folk', 'country', 'r&b', 'techno', 
      'house', 'classical', 'alternative', 'edm', 'dubstep'
    ];
    
    const lowerText = text.toLowerCase();
    
    for (const genre of genreKeywords) {
      if (lowerText.includes(genre)) {
        return genre;
      }
    }
    
    return undefined;
  }
  
  /**
   * Fetch HTML content from a URL
   * @param url URL to fetch
   */
  protected async fetchHtml(url: string): Promise<string> {
    try {
      const response = await axios({
        url,
        timeout: 30000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });
      
      return response.data;
    } catch (error) {
      this.logFailure(url, error);
      throw error;
    }
  }
  
  /**
   * Load HTML content into cheerio
   * @param html HTML content
   */
  protected loadCheerio(html: string): cheerio.CheerioAPI {
    return cheerio.load(html);
  }
  
  /**
   * Clean text by removing extra whitespace
   * @param text Text to clean
   */
  protected cleanText(text: string | undefined): string {
    if (!text) return '';
    return text.trim()
      .replace(/\s+/g, ' ')
      .replace(/\n+/g, ' ')
      .replace(/\t+/g, ' ');
  }
}