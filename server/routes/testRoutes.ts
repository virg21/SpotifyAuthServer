import express from 'express';
import { emailService } from '../utils/emailService';
import * as sendgrid from '../utils/sendgrid';

const router = express.Router();

/**
 * Test SendGrid email functionality
 * @route POST /api/test/email
 * @access Public (for testing only - should be restricted in production)
 */
router.post('/email', async (req, res) => {
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

export default router;