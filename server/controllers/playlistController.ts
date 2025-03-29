import { Request, Response } from 'express';
import { storage } from '../storage';
import { SpotifyApi } from '../utils/spotifyApi';
import { createPlaylistSchema } from '../../shared/schema';
import { emailService } from '../utils/emailService';
import { z } from 'zod';

// Extended Express Request with user
interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    [key: string]: any;
  };
}

/**
 * Generate a playlist based on event mood
 * @route POST /api/playlists/generate
 */
export const generatePlaylist = async (req: AuthenticatedRequest, res: Response) => {
  try {
    // Validate request body
    const validationResult = createPlaylistSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        message: 'Invalid request data',
        errors: validationResult.error.errors
      });
    }

    // Extract validated data
    const { eventId, mood, playlistName } = validationResult.data;

    // Check user authentication and get user ID
    const userId = parseInt(req.params.userId || req.user?.id?.toString() || '', 10);
    if (isNaN(userId)) {
      return res.status(401).json({ message: 'User ID is required' });
    }

    // Retrieve user to get Spotify access token
    const user = await storage.getUser(userId);
    if (!user || !user.accessToken) {
      return res.status(401).json({
        message: 'User not authenticated with Spotify'
      });
    }

    // Retrieve event details
    const event = await storage.getEventById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Extract key information from the event
    const eventGenre = event.genre || 'pop'; // Default to pop if no genre is specified
    const eventName = playlistName || event.name;
    
    // Extract artist name from event name if possible
    let eventArtist: string | undefined;
    if (event.name.includes(' - ')) {
      [eventArtist] = event.name.split(' - ');
    }

    // Initialize Spotify API with user's access token
    const spotifyApi = new SpotifyApi(user.accessToken);

    // Generate playlist
    const { playlist, tracks } = await spotifyApi.generateEventPlaylist(
      eventGenre,
      eventName,
      eventArtist,
      mood,
      25 // Default to 25 tracks
    );

    // Store playlist information in database
    const savedPlaylist = await storage.createPlaylist({
      userId,
      eventId: event.id,
      spotifyPlaylistId: playlist.id,
      name: playlist.name,
      description: playlist.description,
      imageUrl: playlist.images.length > 0 ? playlist.images[0].url : null,
      tracks: JSON.stringify(tracks), // Convert tracks to JSON string to match schema
      mood: mood || null,
      isPublic: playlist.public,
      createdAt: new Date()
    });

    // Send email notification if user has notifications enabled
    try {
      if (user && user.email && user.emailVerified && user.notificationsEnabled) {
        // Send notification email asynchronously
        emailService.sendPlaylistNotification(
          user.email, 
          playlist.name, 
          event.name, 
          playlist.external_urls.spotify
        ).then(success => {
          if (success) {
            console.log(`Playlist notification email sent successfully to ${user.email}`);
          } else {
            console.warn(`Failed to send playlist notification email to ${user.email}`);
          }
        }).catch(err => {
          console.error('Failed to send playlist notification email:', err);
        });
      } else {
        console.log('Skipping email notification: user has not enabled notifications or email is not verified');
      }
    } catch (emailError) {
      console.error('Error sending playlist notification email:', emailError);
      // Don't fail the request if email sending fails
    }

    // Return success response
    res.status(201).json({
      message: 'Playlist generated successfully',
      playlist: savedPlaylist,
      spotifyUrl: playlist.external_urls.spotify
    });
  } catch (error) {
    console.error('Error generating playlist:', error);
    res.status(500).json({
      message: 'Failed to generate playlist',
      error: (error as Error).message
    });
  }
};

/**
 * Get all playlists for a user
 * @route GET /api/playlists
 */
export const getUserPlaylists = async (req: AuthenticatedRequest, res: Response) => {
  try {
    // Check user authentication and get user ID
    const userId = parseInt(req.params.userId || req.user?.id?.toString() || '', 10);
    if (isNaN(userId)) {
      return res.status(401).json({ message: 'User ID is required' });
    }

    // Retrieve user's playlists
    const playlists = await storage.getPlaylistsByUserId(userId);

    // Return playlists
    res.status(200).json({
      message: 'Playlists retrieved successfully',
      playlists: playlists
    });
  } catch (error) {
    console.error('Error retrieving playlists:', error);
    res.status(500).json({
      message: 'Failed to retrieve playlists',
      error: (error as Error).message
    });
  }
};

/**
 * Get a specific playlist by ID
 * @route GET /api/playlists/:id
 */
export const getPlaylist = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const playlistId = parseInt(req.params.id, 10);
    if (isNaN(playlistId)) {
      return res.status(400).json({ message: 'Invalid playlist ID' });
    }

    // Retrieve playlist
    const playlist = await storage.getPlaylistById(playlistId);
    if (!playlist) {
      return res.status(404).json({ message: 'Playlist not found' });
    }

    // Check if user has access to this playlist
    const userId = parseInt(req.params.userId || req.user?.id?.toString() || '', 10);
    if (!isNaN(userId) && playlist.userId !== userId && !playlist.isPublic) {
      return res.status(403).json({ message: 'Access denied to this playlist' });
    }

    // Return playlist details
    res.status(200).json({
      message: 'Playlist retrieved successfully',
      playlist: playlist
    });
  } catch (error) {
    console.error('Error retrieving playlist:', error);
    res.status(500).json({
      message: 'Failed to retrieve playlist',
      error: (error as Error).message
    });
  }
};

/**
 * Get playlists for a specific event
 * @route GET /api/events/:eventId/playlists
 */
export const getEventPlaylists = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const eventId = parseInt(req.params.eventId, 10);
    if (isNaN(eventId)) {
      return res.status(400).json({ message: 'Invalid event ID' });
    }

    // Retrieve playlists for the event
    const playlists = await storage.getPlaylistsByEventId(eventId);

    // Filter out private playlists if not owned by the user
    const userId = parseInt(req.params.userId || req.user?.id?.toString() || '', 10);
    const filteredPlaylists = isNaN(userId)
      ? playlists.filter(playlist => playlist.isPublic)
      : playlists.filter(playlist => playlist.isPublic || playlist.userId === userId);

    // Return playlists
    res.status(200).json({
      message: 'Event playlists retrieved successfully',
      playlists: filteredPlaylists
    });
  } catch (error) {
    console.error('Error retrieving event playlists:', error);
    res.status(500).json({
      message: 'Failed to retrieve event playlists',
      error: (error as Error).message
    });
  }
};

/**
 * Delete a playlist
 * @route DELETE /api/playlists/:id
 */
export const deletePlaylist = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const playlistId = parseInt(req.params.id, 10);
    if (isNaN(playlistId)) {
      return res.status(400).json({ message: 'Invalid playlist ID' });
    }

    // Get playlist to check ownership
    const playlist = await storage.getPlaylistById(playlistId);
    if (!playlist) {
      return res.status(404).json({ message: 'Playlist not found' });
    }

    // Check if user owns this playlist
    const userId = parseInt(req.params.userId || req.user?.id?.toString() || '', 10);
    if (isNaN(userId) || playlist.userId !== userId) {
      return res.status(403).json({ message: 'You do not have permission to delete this playlist' });
    }

    // Delete playlist from our database
    const deleted = await storage.deletePlaylist(playlistId);
    if (!deleted) {
      return res.status(500).json({ message: 'Failed to delete playlist' });
    }

    // Note: We don't delete the playlist from Spotify as the user might still want it there

    // Return success
    res.status(200).json({
      message: 'Playlist deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting playlist:', error);
    res.status(500).json({
      message: 'Failed to delete playlist',
      error: (error as Error).message
    });
  }
};