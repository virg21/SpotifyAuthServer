import axios from 'axios';

export class SpotifyApi {
  private accessToken: string;
  private userId: string | null = null;

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  /**
   * Get the current user's profile
   */
  async getCurrentUser() {
    try {
      const response = await axios.get('https://api.spotify.com/v1/me', {
        headers: { 'Authorization': `Bearer ${this.accessToken}` }
      });
      this.userId = response.data.id;
      return response.data;
    } catch (error) {
      console.error('Error fetching Spotify user profile:', error);
      throw new Error('Failed to fetch Spotify user profile');
    }
  }

  /**
   * Create a new playlist for the user
   */
  async createPlaylist(name: string, description: string = '', isPublic: boolean = true) {
    if (!this.userId) {
      await this.getCurrentUser();
    }

    try {
      const response = await axios.post(
        `https://api.spotify.com/v1/users/${this.userId}/playlists`,
        {
          name,
          description,
          public: isPublic
        },
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error creating Spotify playlist:', error);
      throw new Error('Failed to create Spotify playlist');
    }
  }

  /**
   * Add tracks to a playlist
   */
  async addTracksToPlaylist(playlistId: string, trackUris: string[]) {
    try {
      // Spotify API limits 100 tracks per request
      const chunkSize = 100;
      const chunks = [];
      
      for (let i = 0; i < trackUris.length; i += chunkSize) {
        chunks.push(trackUris.slice(i, i + chunkSize));
      }
      
      const results = [];
      
      for (const chunk of chunks) {
        const response = await axios.post(
          `https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
          {
            uris: chunk
          },
          {
            headers: {
              'Authorization': `Bearer ${this.accessToken}`,
              'Content-Type': 'application/json'
            }
          }
        );
        results.push(response.data);
      }
      
      return results;
    } catch (error) {
      console.error('Error adding tracks to Spotify playlist:', error);
      throw new Error('Failed to add tracks to Spotify playlist');
    }
  }

  /**
   * Get recommendations based on seeds (genres, artists, tracks)
   */
  async getRecommendations(options: {
    seed_genres?: string[];
    seed_artists?: string[];
    seed_tracks?: string[];
    limit?: number;
    target_energy?: number;
    target_danceability?: number;
    target_valence?: number;
    min_popularity?: number;
  }) {
    try {
      const params = new URLSearchParams();
      
      if (options.seed_genres && options.seed_genres.length > 0) {
        params.append('seed_genres', options.seed_genres.slice(0, 5).join(','));
      }
      
      if (options.seed_artists && options.seed_artists.length > 0) {
        params.append('seed_artists', options.seed_artists.slice(0, 5).join(','));
      }
      
      if (options.seed_tracks && options.seed_tracks.length > 0) {
        params.append('seed_tracks', options.seed_tracks.slice(0, 5).join(','));
      }
      
      if (options.limit) {
        params.append('limit', options.limit.toString());
      }
      
      if (options.target_energy !== undefined) {
        params.append('target_energy', options.target_energy.toString());
      }
      
      if (options.target_danceability !== undefined) {
        params.append('target_danceability', options.target_danceability.toString());
      }
      
      if (options.target_valence !== undefined) {
        params.append('target_valence', options.target_valence.toString());
      }
      
      if (options.min_popularity !== undefined) {
        params.append('min_popularity', options.min_popularity.toString());
      }
      
      const response = await axios.get(
        `https://api.spotify.com/v1/recommendations?${params.toString()}`,
        {
          headers: { 'Authorization': `Bearer ${this.accessToken}` }
        }
      );
      
      return response.data;
    } catch (error) {
      console.error('Error getting Spotify recommendations:', error);
      throw new Error('Failed to get Spotify recommendations');
    }
  }

  /**
   * Search Spotify for items
   */
  async search(query: string, type: string = 'track,artist', limit: number = 20) {
    try {
      const params = new URLSearchParams({
        q: query,
        type,
        limit: limit.toString()
      });
      
      const response = await axios.get(
        `https://api.spotify.com/v1/search?${params.toString()}`,
        {
          headers: { 'Authorization': `Bearer ${this.accessToken}` }
        }
      );
      
      return response.data;
    } catch (error) {
      console.error('Error searching Spotify:', error);
      throw new Error('Failed to search Spotify');
    }
  }

  /**
   * Get a track's audio features
   */
  async getAudioFeatures(trackId: string) {
    try {
      const response = await axios.get(
        `https://api.spotify.com/v1/audio-features/${trackId}`,
        {
          headers: { 'Authorization': `Bearer ${this.accessToken}` }
        }
      );
      
      return response.data;
    } catch (error) {
      console.error('Error getting track audio features:', error);
      throw new Error('Failed to get track audio features');
    }
  }
}