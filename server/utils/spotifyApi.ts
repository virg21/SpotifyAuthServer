import axios from 'axios';
import { getEnv } from '../config/env';

export interface SpotifyArtist {
  id: string;
  name: string;
  genres: string[];
  popularity: number;
  images: { url: string; height: number; width: number }[];
}

export interface SpotifyTrack {
  id: string;
  name: string;
  album: {
    id: string;
    name: string;
    release_date: string;
    images: { url: string; height: number; width: number }[];
  };
  artists: SpotifyArtist[];
  duration_ms: number;
  popularity: number;
}

export interface SpotifyUserProfile {
  id: string;
  display_name: string;
  email: string;
  images: { url: string; height: number; width: number }[];
  country: string;
  product: string;
}

export interface MusicPersonalitySummary {
  topArtists: SpotifyArtist[];
  topTracks: SpotifyTrack[];
  topGenres: { genre: string; count: number }[];
  moodScore: number;  // 0-100 scale (low = melancholic, high = upbeat)
  genreProfile: { [key: string]: number }; // Categories and their scores
  eraBias: { [key: string]: number }; // Different music eras and their weights
}

/**
 * Utility class for Spotify API requests
 */
export class SpotifyApi {
  private accessToken: string;
  private clientId: string;
  private clientSecret: string;

  constructor(accessToken: string) {
    this.accessToken = accessToken;
    this.clientId = getEnv('SPOTIFY_CLIENT_ID');
    this.clientSecret = getEnv('SPOTIFY_CLIENT_SECRET');
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
        url: `https://api.spotify.com/v1/${endpoint}`,
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
        data,
      });
      
      return response.data;
    } catch (error) {
      console.error(`Spotify API error for ${method} ${endpoint}:`, error);
      throw error;
    }
  }

  /**
   * Get a new access token using refresh token
   */
  static async refreshAccessToken(refreshToken: string): Promise<{ access_token: string; expires_in: number }> {
    try {
      const clientId = getEnv('SPOTIFY_CLIENT_ID');
      const clientSecret = getEnv('SPOTIFY_CLIENT_SECRET');
      
      const response = await axios({
        method: 'POST',
        url: 'https://accounts.spotify.com/api/token',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
        },
        data: new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: refreshToken,
        }).toString(),
      });
      
      return {
        access_token: response.data.access_token,
        expires_in: response.data.expires_in,
      };
    } catch (error) {
      console.error('Error refreshing access token:', error);
      throw error;
    }
  }

  /**
   * Get current user's profile information
   */
  async getCurrentUserProfile(): Promise<SpotifyUserProfile> {
    return this.request('me');
  }

  /**
   * Get current user's saved tracks
   */
  async getUserSavedTracks(limit: number = 20, offset: number = 0) {
    return this.request(`me/tracks?limit=${limit}&offset=${offset}`);
  }

  /**
   * Get user's top artists
   * 
   * @param timeRange short_term (4 weeks), medium_term (6 months), or long_term (years)
   * @param limit Number of artists to return
   */
  async getUserTopArtists(timeRange: 'short_term' | 'medium_term' | 'long_term' = 'medium_term', limit: number = 20): Promise<{ items: SpotifyArtist[] }> {
    return this.request(`me/top/artists?time_range=${timeRange}&limit=${limit}`);
  }

  /**
   * Get user's top tracks
   * 
   * @param timeRange short_term (4 weeks), medium_term (6 months), or long_term (years)
   * @param limit Number of tracks to return
   */
  async getUserTopTracks(timeRange: 'short_term' | 'medium_term' | 'long_term' = 'medium_term', limit: number = 20): Promise<{ items: SpotifyTrack[] }> {
    return this.request(`me/top/tracks?time_range=${timeRange}&limit=${limit}`);
  }

  /**
   * Get audio features for multiple tracks
   * 
   * @param trackIds Array of track IDs to get audio features for
   */
  async getAudioFeatures(trackIds: string[]) {
    return this.request(`audio-features?ids=${trackIds.join(',')}`);
  }

  /**
   * Get recently played tracks
   * 
   * @param limit Number of tracks to return
   */
  async getRecentlyPlayed(limit: number = 20) {
    return this.request(`me/player/recently-played?limit=${limit}`);
  }

  /**
   * Generate a comprehensive music personality summary
   * Combines data from multiple endpoints to create a user profile
   */
  async generateMusicPersonalitySummary(): Promise<MusicPersonalitySummary> {
    // Get top artists
    const topArtistsResponse = await this.getUserTopArtists('medium_term', 25);
    const topArtists = topArtistsResponse.items;
    
    // Get top tracks
    const topTracksResponse = await this.getUserTopTracks('medium_term', 25);
    const topTracks = topTracksResponse.items;
    
    // Extract all genres from top artists
    const genres: string[] = [];
    topArtists.forEach(artist => {
      genres.push(...artist.genres);
    });
    
    // Count genre occurrences
    const genreCounts: { [key: string]: number } = {};
    genres.forEach(genre => {
      genreCounts[genre] = (genreCounts[genre] || 0) + 1;
    });
    
    // Convert to sorted array
    const topGenres = Object.entries(genreCounts)
      .map(([genre, count]) => ({ genre, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 15);
    
    // Get audio features for top tracks
    const trackIds = topTracks.map(track => track.id);
    const audioFeaturesResponse = await this.getAudioFeatures(trackIds);
    const audioFeatures = audioFeaturesResponse.audio_features || [];
    
    // Calculate average mood score based on valence and energy
    const moodScore = audioFeatures.length > 0
      ? Math.round(
          audioFeatures.reduce((sum: number, feature: any) => {
            return sum + (feature.valence * 0.6 + feature.energy * 0.4);
          }, 0) / audioFeatures.length * 100
        )
      : 50; // Default to neutral if no data
    
    // Create genre profile
    const genreProfile = {
      electronic: 0,
      rock: 0,
      hiphop: 0,
      pop: 0,
      jazz: 0,
      folk: 0,
      classical: 0,
      world: 0,
    };
    
    // Analyze genres and map to categories
    genres.forEach(genre => {
      if (/electro|edm|techno|house|dance|dubstep|trance/.test(genre)) {
        genreProfile.electronic += 1;
      } else if (/rock|metal|punk|indie|alternative/.test(genre)) {
        genreProfile.rock += 1;
      } else if (/hip|hop|rap|trap|grime|drill/.test(genre)) {
        genreProfile.hiphop += 1;
      } else if (/pop|chart|contemporary|r&b/.test(genre)) {
        genreProfile.pop += 1;
      } else if (/jazz|blues|soul|funk|r&b/.test(genre)) {
        genreProfile.jazz += 1;
      } else if (/folk|acoustic|singer|songwriter|country/.test(genre)) {
        genreProfile.folk += 1;
      } else if (/classical|orchestra|instrumental|ambient|soundtrack/.test(genre)) {
        genreProfile.classical += 1;
      } else if (/world|latin|reggae|afro|asian|ethnic/.test(genre)) {
        genreProfile.world += 1;
      }
    });
    
    // Normalize genre profile
    const totalGenres = Object.values(genreProfile).reduce((a, b) => a + b, 0);
    if (totalGenres > 0) {
      Object.keys(genreProfile).forEach(key => {
        genreProfile[key as keyof typeof genreProfile] = Math.round(
          (genreProfile[key as keyof typeof genreProfile] / totalGenres) * 100
        );
      });
    }
    
    // Analyze era bias based on release dates
    const eraBias = {
      '60s70s': 0,
      '80s': 0,
      '90s': 0,
      '2000s': 0,
      '2010s': 0,
      'current': 0,
    };
    
    // Process release years
    topTracks.forEach(track => {
      const releaseYear = track.album.release_date 
        ? new Date(track.album.release_date).getFullYear() 
        : new Date().getFullYear();
      
      if (releaseYear < 1980) eraBias['60s70s'] += 1;
      else if (releaseYear < 1990) eraBias['80s'] += 1;
      else if (releaseYear < 2000) eraBias['90s'] += 1;
      else if (releaseYear < 2010) eraBias['2000s'] += 1;
      else if (releaseYear < 2020) eraBias['2010s'] += 1;
      else eraBias['current'] += 1;
    });
    
    // Normalize era bias
    const totalTracks = topTracks.length;
    if (totalTracks > 0) {
      Object.keys(eraBias).forEach(key => {
        eraBias[key as keyof typeof eraBias] = Math.round(
          (eraBias[key as keyof typeof eraBias] / totalTracks) * 100
        );
      });
    }
    
    return {
      topArtists,
      topTracks,
      topGenres,
      moodScore,
      genreProfile,
      eraBias,
    };
  }
}