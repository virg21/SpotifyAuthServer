import { Request, Response } from 'express';
import { Event, User, MusicSummary } from '@shared/schema';
import { emailService } from '../utils/emailService';
import { storage } from '../storage';

/**
 * Send personalized event recommendations to a specific user via email
 * @route POST /api/notifications/events/:userId
 */
export const sendEventRecommendations = async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);
    
    if (isNaN(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID'
      });
    }
    
    // Get user information
    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Check if user has notifications enabled
    if (!user.notificationsEnabled) {
      return res.status(400).json({
        success: false,
        message: 'User has not enabled notifications'
      });
    }
    
    // Check if user has an email
    if (!user.email) {
      return res.status(400).json({
        success: false,
        message: 'User does not have an email address'
      });
    }
    
    // Get user's music summary for personalization
    const musicSummary = await storage.getMusicSummary(userId);
    if (!musicSummary) {
      return res.status(400).json({
        success: false,
        message: 'User does not have music preference data'
      });
    }
    
    // Get events that might interest the user
    // For now, we'll get all events and personalize them
    const allEvents = await storage.getAllEvents();
    
    if (allEvents.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No events found to recommend'
      });
    }
    
    // Get upcoming events (within the next 30 days)
    const now = new Date();
    const thirtyDaysLater = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    let upcomingEvents = allEvents.filter((event: Event) => {
      return event.date > now && event.date < thirtyDaysLater;
    });
    
    if (upcomingEvents.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No upcoming events found to recommend'
      });
    }
    
    // Personalize events with relevance scores
    interface EnhancedEvent extends Event {
      relevanceScore: number;
      personalReason: string;
    }
    
    const enhancedEvents = upcomingEvents.map((event: Event) => {
      // Calculate a relevance score based on user's music taste
      let score = 0;
      let reason = '';
      
      // Check for genre match
      if (event.genre && musicSummary.topGenres) {
        const eventGenre = event.genre.toLowerCase();
        const topGenres = musicSummary.topGenres as { genre: string, count: number }[];
        const recentGenres = musicSummary.recentGenres as { genre: string, count: number }[] || [];
        
        for (const genreData of topGenres) {
          if (eventGenre.includes(genreData.genre.toLowerCase())) {
            score += 3 * (genreData.count / 10);
            reason = `Because ${genreData.genre} is one of your favorite genres`;
            break;
          }
        }
        
        // If no match in top genres, check recent genres
        if (score === 0 && recentGenres.length > 0) {
          for (const genreData of recentGenres) {
            if (eventGenre.includes(genreData.genre.toLowerCase())) {
              score += 2 * (genreData.count / 10);
              reason = `Matching your recent interest in ${genreData.genre} music`;
              break;
            }
          }
        }
      }
      
      // Check for artist match
      if (event.name && musicSummary.topArtists) {
        const eventName = event.name.toLowerCase();
        const topArtists = musicSummary.topArtists as { name: string, count: number }[];
        
        for (const artistData of topArtists) {
          if (eventName.includes(artistData.name.toLowerCase())) {
            score += 5 * (artistData.count / 10);
            reason = `Your most streamed artist ${artistData.name} is performing nearby`;
            break;
          }
        }
      }
      
      // If still no reason, use a generic one
      if (!reason) {
        reason = "Based on your music profile";
      }
      
      return {
        ...event,
        relevanceScore: score,
        personalReason: reason
      };
    });
    
    // Sort by relevance and take top 5
    const sortedEvents = enhancedEvents
      .sort((a: EnhancedEvent, b: EnhancedEvent) => b.relevanceScore - a.relevanceScore)
      .slice(0, 5);
    
    // Format events for email
    const emailEvents = sortedEvents.map((event: EnhancedEvent) => ({
      name: event.name,
      venue: event.venue,
      date: event.date,
      url: event.ticketUrl || undefined,
      reason: event.personalReason || event.reason || undefined,
      price: event.price || undefined,
      genre: event.genre || undefined
    }));
    
    // Send email with personalized recommendations
    const success = await emailService.sendEventRecommendations(user.email, emailEvents);
    
    if (success) {
      return res.status(200).json({
        success: true,
        message: 'Event recommendations sent successfully',
        sentEvents: emailEvents.length
      });
    } else {
      return res.status(500).json({
        success: false,
        message: 'Failed to send event recommendations email'
      });
    }
  } catch (error) {
    console.error('Error sending event recommendations:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to send event recommendations',
      error: (error as Error).message
    });
  }
};

/**
 * Send personalized event recommendations to all users who have enabled notifications
 * @route POST /api/notifications/events/broadcast
 * @access Admin only
 */
export const broadcastEventRecommendations = async (_req: Request, res: Response) => {
  try {
    // Get all users with notifications enabled
    const allUsers = await storage.getUsers();
    const usersWithNotifications = allUsers.filter(
      (user: User) => user.notificationsEnabled && user.email
    );
    
    if (usersWithNotifications.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No users with notifications enabled found'
      });
    }
    
    // Track success and failure counts
    let successCount = 0;
    let failureCount = 0;
    
    // Get all events first
    const allEvents = await storage.getAllEvents();
    if (allEvents.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No events found to recommend'
      });
    }
    
    // Get upcoming events (next 30 days)
    const now = new Date();
    const thirtyDaysLater = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const upcomingEvents = allEvents.filter((event: Event) => {
      return event.date > now && event.date < thirtyDaysLater;
    });
    
    if (upcomingEvents.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No upcoming events found to recommend'
      });
    }
    
    // Send recommendations to each user
    const emailPromises = usersWithNotifications.map(async (user: User) => {
      try {
        // Get user's music summary
        const musicSummary = await storage.getMusicSummary(user.id);
        if (!musicSummary) {
          console.log(`User ${user.id} has no music summary, skipping recommendations`);
          return { success: false, userId: user.id, error: 'No music summary found' };
        }
        
        // Score and personalize events for this user
        const personalizedEvents = upcomingEvents.map((event: Event) => {
          let relevanceScore = 1; // Base score
          let reason = '';
          
          // Score based on genre
          if (event.genre && musicSummary.topGenres) {
            const eventGenre = event.genre.toLowerCase();
            const topGenres = musicSummary.topGenres as { genre: string, count: number }[];
            
            for (const genreData of topGenres) {
              if (eventGenre.includes(genreData.genre.toLowerCase())) {
                relevanceScore += 3 * (genreData.count / 10);
                reason = `Because ${genreData.genre} is one of your favorite genres`;
                break;
              }
            }
          }
          
          // Score based on artist
          if (!reason && event.name && musicSummary.topArtists) {
            const eventName = event.name.toLowerCase();
            const topArtists = musicSummary.topArtists as { name: string, count: number }[];
            
            for (const artistData of topArtists.slice(0, 5)) {
              if (eventName.includes(artistData.name.toLowerCase())) {
                relevanceScore += 5 * (artistData.count / 10);
                reason = `Your most streamed artist ${artistData.name} is performing nearby`;
                break;
              }
            }
          }
          
          // Default reason if none matched
          if (!reason) {
            reason = "Recommended based on your music profile";
          }
          
          return {
            ...event,
            relevanceScore,
            personalReason: reason
          };
        });
        
        // Define interface for the enhanced events
        interface EnhancedEvent extends Event {
          relevanceScore: number;
          personalReason: string;
        }
        
        // Sort by relevance and take top 5
        const topEvents = personalizedEvents
          .sort((a: EnhancedEvent, b: EnhancedEvent) => b.relevanceScore - a.relevanceScore)
          .slice(0, 5);
        
        // Format for email
        const emailEvents = topEvents.map((event: EnhancedEvent) => ({
          name: event.name,
          venue: event.venue,
          date: event.date,
          url: event.ticketUrl || undefined,
          reason: event.personalReason || event.reason || undefined,
          price: event.price || undefined,
          genre: event.genre || undefined
        }));
        
        // Send the email
        const emailSuccess = await emailService.sendEventRecommendations(
          user.email!,
          emailEvents
        );
        
        return { 
          success: emailSuccess, 
          userId: user.id,
          emailCount: emailEvents.length
        };
      } catch (error) {
        console.error(`Error sending recommendations to user ${user.id}:`, error);
        return { 
          success: false, 
          userId: user.id, 
          error: (error as Error).message 
        };
      }
    });
    
    // Wait for all emails to be sent
    const results = await Promise.all(emailPromises);
    
    // Count successes and failures
    results.forEach(result => {
      if (result?.success) {
        successCount++;
      } else {
        failureCount++;
      }
    });
    
    return res.status(200).json({
      success: true,
      message: 'Event recommendation broadcast complete',
      stats: {
        totalUsers: usersWithNotifications.length,
        successful: successCount,
        failed: failureCount
      }
    });
  } catch (error) {
    console.error('Error broadcasting event recommendations:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to broadcast event recommendations',
      error: (error as Error).message
    });
  }
};