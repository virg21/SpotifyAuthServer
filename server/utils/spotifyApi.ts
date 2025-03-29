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

export interface SpotifyPlaylist {
  id: string;
  name: string;
  description: string;
  public: boolean;
  collaborative: boolean;
  images: { url: string; height: number; width: number }[];
  tracks: {
    total: number;
    items: {
      track: SpotifyTrack;
    }[];
  };
  owner: {
    id: string;
    display_name: string;
  };
  external_urls: {
    spotify: string;
  };
}

/**
 * Utility class for Spotify API requests
 */
export class SpotifyApi {
  private accessToken: string;
  private clientId: string;
  private clientSecret: string;
  private userId: string | null = null;

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
   * @param customHeaders Additional headers to include in the request
   * @returns Response data from Spotify API
   */
  async request(endpoint: string, method: string = 'GET', data?: any, customHeaders?: Record<string, string>) {
    try {
      const headers: Record<string, string> = {
        Authorization: `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
        ...customHeaders
      };

      const response = await axios({
        method,
        url: `https://api.spotify.com/v1/${endpoint}`,
        headers,
        data: method !== 'GET' ? data : undefined,
        params: method === 'GET' && data ? data : undefined,
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

  /**
   * Get the user's ID, caching it for subsequent calls
   */
  async getUserId(): Promise<string> {
    if (!this.userId) {
      const profile = await this.getCurrentUserProfile();
      this.userId = profile.id;
    }
    return this.userId;
  }

  /**
   * Create a new playlist
   * 
   * @param name Playlist name
   * @param description Playlist description
   * @param isPublic Whether the playlist is public
   * @returns Created playlist
   */
  async createPlaylist(name: string, description: string, isPublic: boolean = true): Promise<SpotifyPlaylist> {
    const userId = await this.getUserId();
    
    return this.request(`users/${userId}/playlists`, 'POST', {
      name,
      description,
      public: isPublic
    });
  }

  /**
   * Add tracks to a playlist
   * 
   * @param playlistId Playlist ID
   * @param trackUris Array of Spotify track URIs to add
   * @returns Response from the API
   */
  async addTracksToPlaylist(playlistId: string, trackUris: string[]): Promise<any> {
    return this.request(`playlists/${playlistId}/tracks`, 'POST', {
      uris: trackUris
    });
  }

  /**
   * Get a playlist by ID
   * 
   * @param playlistId Playlist ID
   * @returns Playlist details
   */
  async getPlaylist(playlistId: string): Promise<SpotifyPlaylist> {
    return this.request(`playlists/${playlistId}`);
  }

  /**
   * Update a playlist's details
   * 
   * @param playlistId Playlist ID
   * @param details Object containing fields to update (name, description, public)
   * @returns Success status
   */
  async updatePlaylist(playlistId: string, details: { name?: string; description?: string; public?: boolean }): Promise<any> {
    return this.request(`playlists/${playlistId}`, 'PUT', details);
  }

  /**
   * Upload a custom image for a playlist
   * 
   * @param playlistId Playlist ID
   * @param imageBase64 Base64 encoded JPEG image data (without the 'data:image/jpeg;base64,' prefix)
   * @returns Success status
   */
  async uploadPlaylistImage(playlistId: string, imageBase64: string): Promise<any> {
    return this.request(`playlists/${playlistId}/images`, 'PUT', imageBase64, {
      'Content-Type': 'image/jpeg'
    });
  }

  /**
   * Search Spotify catalog for tracks matching the query and mood
   * 
   * @param query Search query (artist, genre, etc.)
   * @param limit Maximum number of results to return
   * @param mood Optional mood parameter to filter results
   * @returns Search results
   */
  async searchTracks(query: string, limit: number = 20, mood?: string): Promise<{ tracks: { items: SpotifyTrack[] } }> {
    let searchQuery = query;
    
    // Add mood parameters to the search query if specified
    if (mood) {
      switch (mood) {
        case 'energetic':
          searchQuery = `${searchQuery} energy:>0.7`;
          break;
        case 'chill':
          searchQuery = `${searchQuery} energy:<0.4`;
          break;
        case 'happy':
          searchQuery = `${searchQuery} valence:>0.7`;
          break;
        case 'focused':
          searchQuery = `${searchQuery} tempo:>100 instrumentalness:>0.5`;
          break;
        case 'party':
          searchQuery = `${searchQuery} energy:>0.8 danceability:>0.7`;
          break;
        case 'romantic':
          searchQuery = `${searchQuery} acousticness:>0.5 valence:>0.5`;
          break;
      }
    }
    
    return this.request(`search?q=${encodeURIComponent(searchQuery)}&type=track&limit=${limit}`);
  }

  /**
   * Generate a playlist based on event genre and mood
   * 
   * @param eventGenre Primary genre of the event
   * @param eventName Name of the event
   * @param eventArtist Main artist of the event, if available
   * @param mood Desired mood for the playlist
   * @param trackCount Number of tracks to include
   * @returns Created playlist with tracks
   */
  async generateEventPlaylist(
    eventGenre: string, 
    eventName: string, 
    eventArtist?: string,
    mood?: string,
    trackCount: number = 20
  ): Promise<{ playlist: SpotifyPlaylist; tracks: SpotifyTrack[] }> {
    try {
      // Create a descriptive playlist name and description
      const playlistName = eventArtist 
        ? `${eventName}: ${eventArtist} Vibes`
        : `${eventName} Mood`;
      
      const moodDescription = mood 
        ? `A ${mood} playlist for` 
        : 'Music for';
      
      const playlistDescription = `${moodDescription} ${eventName}. Genre: ${eventGenre}`;
      
      // Create the empty playlist
      const playlist = await this.createPlaylist(playlistName, playlistDescription);
      
      // Build search queries based on event information
      const searchQueries = [];
      
      // If we have an artist, add them as a primary search
      if (eventArtist) {
        searchQueries.push(`artist:${eventArtist}`);
      }
      
      // Add genre as a search term
      searchQueries.push(`genre:${eventGenre}`);
      
      // If the genre has related genres, add those too
      const relatedGenres = this.getRelatedGenres(eventGenre);
      if (relatedGenres.length > 0) {
        searchQueries.push(...relatedGenres.map(g => `genre:${g}`));
      }
      
      // Collect tracks from all our search queries
      const allTracks: SpotifyTrack[] = [];
      
      // Perform searches and collect results
      for (const query of searchQueries) {
        try {
          const searchResults = await this.searchTracks(query, Math.ceil(trackCount / searchQueries.length), mood);
          if (searchResults.tracks && searchResults.tracks.items.length > 0) {
            allTracks.push(...searchResults.tracks.items);
          }
        } catch (error) {
          console.error(`Error searching for tracks with query ${query}:`, error);
          // Continue with other queries on error
        }
      }
      
      // If we don't have enough tracks, try a broader search
      if (allTracks.length < trackCount / 2) {
        try {
          const broadSearch = await this.searchTracks(eventGenre, trackCount, mood);
          if (broadSearch.tracks && broadSearch.tracks.items.length > 0) {
            allTracks.push(...broadSearch.tracks.items);
          }
        } catch (error) {
          console.error(`Error during broad search for ${eventGenre}:`, error);
        }
      }
      
      // Deduplicate tracks
      const uniqueTracks = this.deduplicateTracks(allTracks);
      
      // Select tracks up to the desired count, with a shuffle
      const selectedTracks = this.shuffleArray(uniqueTracks).slice(0, trackCount);
      
      // Add tracks to the playlist
      if (selectedTracks.length > 0) {
        const trackUris = selectedTracks.map(track => `spotify:track:${track.id}`);
        await this.addTracksToPlaylist(playlist.id, trackUris);
      }
      
      // Return the final playlist and tracks
      return {
        playlist,
        tracks: selectedTracks
      };
    } catch (error) {
      console.error('Error generating event playlist:', error);
      throw error;
    }
  }

  /**
   * Helper to get related genres for a given genre
   */
  private getRelatedGenres(genre: string): string[] {
    // Map of genres to related genres
    const genreMap: Record<string, string[]> = {
      'rock': ['indie', 'alternative', 'punk', 'metal', 'hard-rock'],
      'pop': ['dance', 'electropop', 'synth-pop', 'indie-pop'],
      'hip hop': ['rap', 'trap', 'r-n-b', 'urban'],
      'rap': ['hip-hop', 'trap', 'grime', 'urban'],
      'metal': ['hard-rock', 'heavy-metal', 'death-metal', 'thrash'],
      'jazz': ['blues', 'soul', 'funk', 'bossa-nova'],
      'electronic': ['techno', 'house', 'dance', 'edm', 'electronica'],
      'folk': ['singer-songwriter', 'acoustic', 'indie-folk'],
      'classical': ['instrumental', 'orchestral', 'chamber', 'opera'],
      'reggae': ['dub', 'dancehall', 'ska', 'roots'],
      'country': ['americana', 'bluegrass', 'folk', 'western'],
      'blues': ['jazz', 'soul', 'r-n-b', 'rock-n-roll'],
      'indie': ['alternative', 'indie-rock', 'indie-pop', 'indie-folk'],
      'soul': ['r-n-b', 'funk', 'motown', 'gospel'],
      'punk': ['hardcore', 'post-punk', 'punk-rock', 'alternative'],
      'disco': ['funk', 'dance', 'pop', '80s'],
      'edm': ['electronic', 'dance', 'house', 'techno'],
      'techno': ['electronic', 'house', 'dance', 'industrial'],
      'alternative': ['indie', 'grunge', 'punk', 'post-rock'],
    };
    
    // Normalize the genre name
    const normalizedGenre = genre.toLowerCase().trim();
    
    // Check for exact match
    if (normalizedGenre in genreMap) {
      return genreMap[normalizedGenre];
    }
    
    // Check for partial matches
    for (const key of Object.keys(genreMap)) {
      if (normalizedGenre.includes(key) || key.includes(normalizedGenre)) {
        return genreMap[key];
      }
    }
    
    // Default return empty array if no matches
    return [];
  }

  /**
   * Helper to deduplicate tracks by ID
   */
  private deduplicateTracks(tracks: SpotifyTrack[]): SpotifyTrack[] {
    const seen = new Set();
    return tracks.filter(track => {
      if (seen.has(track.id)) {
        return false;
      }
      seen.add(track.id);
      return true;
    });
  }

  /**
   * Helper to shuffle an array (Fisher-Yates algorithm)
   */
  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }
}