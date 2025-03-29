import express from 'express';
import { emailService } from '../utils/emailService';
import * as sendgrid from '../utils/sendgrid';
import { getTestLimiter } from '../middleware/rateLimiter';
import { storage } from '../storage';
import { InsertUser } from '@shared/schema';

const router = express.Router();

/**
 * Test SendGrid email functionality
 * @route POST /api/test/email
 * @access Public (for testing only - should be restricted in production)
 */
router.post('/email', getTestLimiter(), async (req, res) => {
  try {
    const { email, type } = req.body;
    
    if (!email) {
      return res.status(400).json({ message: 'Email address is required' });
    }
    
    if (!process.env.SENDGRID_API_KEY || !process.env.SENDGRID_FROM_EMAIL) {
      return res.status(500).json({ 
        message: 'SendGrid configuration is incomplete',
        missingVars: [
          !process.env.SENDGRID_API_KEY ? 'SENDGRID_API_KEY' : null,
          !process.env.SENDGRID_FROM_EMAIL ? 'SENDGRID_FROM_EMAIL' : null
        ].filter(Boolean)
      });
    }
    
    let success = false;
    
    // For events type email, we need at least one event in the system
    if (type === 'events') {
      const events = await storage.getAllEvents();
      if (events.length === 0) {
        return res.status(400).json({ 
          message: 'No events available for event recommendations email',
          hint: 'Create a test event first using POST /api/events/test'
        });
      }
      
      // Create test events for email
      const now = new Date();
      const thirtyDaysLater = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      const upcomingEvents = events.filter(event => event.date > now && event.date < thirtyDaysLater);
      
      if (upcomingEvents.length === 0) {
        return res.status(400).json({ 
          message: 'No upcoming events available for recommendations email',
          hint: 'The test events should have dates in the next 30 days'
        });
      }
      
      // Format events for email
      const emailEvents = upcomingEvents.slice(0, 5).map(event => ({
        name: event.name,
        venue: event.venue,
        date: event.date,
        url: event.ticketUrl || undefined,
        reason: "Based on your music preferences",
        price: event.price || undefined,
        genre: event.genre || undefined
      }));
      
      // Send the event recommendations email
      success = await emailService.sendEventRecommendations(email, emailEvents);
    } else {
      // Send appropriate test email based on requested type
      switch (type) {
        case 'verification':
          success = await emailService.sendVerificationCode(email, '123456');
          break;
        
        case 'welcome':
          success = await emailService.sendWelcomeEmail(email, 'Test User');
          break;
          
        case 'playlist': 
          success = await emailService.sendPlaylistNotification(
            email, 
            'Test Event Playlist', 
            'Test Event',
            'https://open.spotify.com/playlist/test'
          );
          break;
          
        case 'sendgrid-direct':
          // Test the direct SendGrid utility
          success = await sendgrid.sendEmail(
            process.env.SENDGRID_API_KEY,
            {
              to: email,
              from: process.env.SENDGRID_FROM_EMAIL,
              subject: 'Test Email from SendGrid Direct',
              text: 'This is a test email sent directly via the SendGrid API.',
              html: '<p>This is a test email sent directly via the <strong>SendGrid API</strong>.</p>'
            }
          );
          break;
          
        default:
          // Default test email using direct SendGrid utility
          success = await sendgrid.sendEmail(
            process.env.SENDGRID_API_KEY || '',
            {
              to: email, 
              from: process.env.SENDGRID_FROM_EMAIL || '',
              subject: 'Test Email',
              text: 'This is a test email from the Music Event Platform.',
              html: '<p>This is a test email from the Music Event Platform.</p>'
            }
          );
      }
    }
    
    if (success) {
      res.status(200).json({ message: 'Test email sent successfully' });
    } else {
      res.status(500).json({ message: 'Failed to send test email' });
    }
  } catch (error) {
    console.error('Error sending test email:', error);
    res.status(500).json({
      message: 'Error sending test email',
      error: (error as Error).message
    });
  }
});

/**
 * Create a test user
 * @route POST /api/test/user
 * @access Public (for testing only - should be restricted in production)
 */
router.post('/user', getTestLimiter(), async (req, res) => {
  try {
    const { username, email, notificationsEnabled } = req.body;
    
    if (!username || !email) {
      return res.status(400).json({ 
        message: 'Username and email are required',
        requiredFields: ['username', 'email']
      });
    }
    
    // Check if user already exists
    const existingUser = await storage.getUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({
        message: 'User with this email already exists',
        userId: existingUser.id
      });
    }
    
    // Create test user
    const userData: InsertUser = {
      username,
      email,
      password: 'test_password', // Added dummy password to satisfy non-null constraint
      spotifyId: 'test_spotify_id_' + Date.now(),
      refreshToken: 'test_refresh_token_' + Date.now(),
      accessToken: 'test_access_token_' + Date.now(),
      displayName: username,
      notificationsEnabled: notificationsEnabled ?? true,
      emailVerified: true,
      phoneVerified: false
    };
    
    const user = await storage.createUser(userData);
    
    // Create sample music summary for the user
    await storage.createMusicSummary({
      userId: user.id,
      topArtists: [
        { name: 'Coldplay', count: 80 },
        { name: 'The Weeknd', count: 65 },
        { name: 'Dua Lipa', count: 50 },
        { name: 'Kendrick Lamar', count: 45 },
        { name: 'Taylor Swift', count: 40 }
      ],
      topTracks: [
        { name: 'Blinding Lights', count: 50 },
        { name: 'Viva La Vida', count: 45 },
        { name: 'Levitating', count: 40 }
      ],
      topGenres: [
        { genre: 'Pop', count: 120 },
        { genre: 'Rock', count: 100 },
        { genre: 'Hip Hop', count: 80 },
        { genre: 'R&B', count: 60 },
        { genre: 'Electronic', count: 50 }
      ],
      recentGenres: [
        { genre: 'Jazz', count: 20 },
        { genre: 'Pop', count: 15 },
        { genre: 'Rock', count: 10 }
      ],
      moodScore: 75,
      genreProfile: {
        mainstream: 0.7,
        niche: 0.3,
        variety: 0.8
      },
      eraBias: {
        current: 0.6,
        classics: 0.4
      },
      lastUpdated: new Date()
    });
    
    res.status(201).json({
      message: 'Test user created successfully',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        notificationsEnabled: user.notificationsEnabled
      }
    });
  } catch (error) {
    console.error('Error creating test user:', error);
    res.status(500).json({
      message: 'Error creating test user',
      error: (error as Error).message
    });
  }
});

/**
 * Get all test users
 * @route GET /api/test/users
 * @access Public (for testing only - should be restricted in production)
 */
router.get('/users', getTestLimiter(), async (req, res) => {
  try {
    const users = await storage.getUsers();
    
    res.status(200).json({
      count: users.length,
      users: users.map(user => ({
        id: user.id,
        username: user.username,
        email: user.email,
        notificationsEnabled: user.notificationsEnabled
      }))
    });
  } catch (error) {
    console.error('Error fetching test users:', error);
    res.status(500).json({
      message: 'Error fetching test users',
      error: (error as Error).message
    });
  }
});

export default router;