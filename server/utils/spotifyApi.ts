import axios from 'axios';
import { getEnv } from '../config/env';

/**
 * Utility class for Spotify API requests
 */
export class SpotifyApi {
  private accessToken: string;
  
  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }
  
  /**
   * Make authenticated request to Spotify API
   * 
   * @param endpoint Spotify API endpoint (without base URL)
   * @param method HTTP method
   * @param data Request body for POST/PUT requests
   * @returns Response data from Spotify API
   */
  async request(endpoint: string, method: string = 'GET', data?: any) {
    try {
      const response = await axios({
        method,
        url: `https://api.spotify.com/v1${endpoint}`,
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        },
        data
      });
      
      return response.data;
    } catch (error) {
      console.error(`Error making Spotify API request to ${endpoint}:`, error);
      throw error;
    }
  }
  
  /**
   * Get current user's profile information
   */
  async getCurrentUserProfile() {
    return this.request('/me');
  }
  
  /**
   * Get current user's saved tracks
   */
  async getUserSavedTracks(limit: number = 20, offset: number = 0) {
    return this.request(`/me/tracks?limit=${limit}&offset=${offset}`);
  }
  
  // Add more API methods as needed for your application
}
