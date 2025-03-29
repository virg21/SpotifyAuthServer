import { MailService } from '@sendgrid/mail';
import { getEnv } from '../config/env';

// Initialize SendGrid API service
if (!process.env.SENDGRID_API_KEY) {
  console.warn('SENDGRID_API_KEY environment variable must be set for email functionality');
}

const mailService = new MailService();
mailService.setApiKey(process.env.SENDGRID_API_KEY || '');

/**
 * Email service for sending various types of emails
 */
export class EmailService {
  private fromEmail: string;

  constructor() {
    // Get the from email from environment variables
    this.fromEmail = process.env.SENDGRID_FROM_EMAIL || '';
    
    // Validate configuration
    if (!process.env.SENDGRID_API_KEY) {
      console.warn('SendGrid API key not set. Email services will not work.');
    }
    
    if (!this.fromEmail) {
      console.warn('SendGrid from email not set. Email services will not work.');
    }
  }

  /**
   * Send email verification code
   * 
   * @param to Recipient email address
   * @param code Verification code
   * @returns Promise with sending result
   */
  async sendVerificationCode(to: string, code: string): Promise<boolean> {
    const subject = 'Verify your email address';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1DB954;">Verify Your Email Address</h2>
        <p>Thank you for registering! Please use the following code to verify your email address:</p>
        <div style="background-color: #f4f4f4; padding: 15px; text-align: center; font-size: 24px; letter-spacing: 5px; font-weight: bold;">
          ${code}
        </div>
        <p>This code will expire in 30 minutes.</p>
        <p>If you didn't request this verification, please ignore this email.</p>
        <hr>
        <p style="font-size: 12px; color: #888;">This is an automated message, please do not reply.</p>
      </div>
    `;
    const text = `Verify Your Email Address\n\nYour verification code is: ${code}\n\nThis code will expire in 30 minutes.`;

    return this.sendEmail(to, subject, html, text);
  }

  /**
   * Send welcome email after successful verification
   * 
   * @param to Recipient email address
   * @param username User's username or display name
   * @returns Promise with sending result
   */
  async sendWelcomeEmail(to: string, username: string): Promise<boolean> {
    const subject = 'Welcome to our Music Event Platform!';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1DB954;">Welcome, ${username}!</h2>
        <p>Thank you for joining our music event platform. Your account is now fully verified!</p>
        <p>You can now:</p>
        <ul>
          <li>Discover music events in your area</li>
          <li>Generate personalized playlists based on events</li>
          <li>Connect with other music enthusiasts</li>
        </ul>
        <p>Start exploring today!</p>
        <hr>
        <p style="font-size: 12px; color: #888;">This is an automated message, please do not reply.</p>
      </div>
    `;
    const text = `Welcome, ${username}!\n\nThank you for joining our music event platform. Your account is now fully verified!\n\nYou can now:\n- Discover music events in your area\n- Generate personalized playlists based on events\n- Connect with other music enthusiasts\n\nStart exploring today!`;

    return this.sendEmail(to, subject, html, text);
  }

  /**
   * Send event recommendation email
   * 
   * @param to Recipient email address
   * @param events Array of event details
   * @returns Promise with sending result
   */
  async sendEventRecommendations(to: string, events: { name: string, venue: string, date: Date, url?: string }[]): Promise<boolean> {
    const subject = 'Music Events You Might Like';
    
    let eventsHtml = '';
    let eventsText = '';
    
    events.forEach(event => {
      const formattedDate = new Date(event.date).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
      
      eventsHtml += `
        <div style="margin-bottom: 20px; border-bottom: 1px solid #eee; padding-bottom: 15px;">
          <h3 style="margin: 0; color: #333;">${event.name}</h3>
          <p style="margin: 5px 0; color: #555;"><strong>Venue:</strong> ${event.venue}</p>
          <p style="margin: 5px 0; color: #555;"><strong>Date:</strong> ${formattedDate}</p>
          ${event.url ? `<a href="${event.url}" style="display: inline-block; padding: 8px 15px; background-color: #1DB954; color: white; text-decoration: none; border-radius: 4px;">View Details</a>` : ''}
        </div>
      `;
      
      eventsText += `
Event: ${event.name}
Venue: ${event.venue}
Date: ${formattedDate}
${event.url ? `Details: ${event.url}` : ''}

`;
    });

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1DB954;">Music Events You Might Enjoy</h2>
        <p>Based on your music preferences, we found these upcoming events that might interest you:</p>
        <div>
          ${eventsHtml}
        </div>
        <p>Check them out and create playlists to match the vibe!</p>
        <hr>
        <p style="font-size: 12px; color: #888;">You received this email because you subscribed to event notifications. 
           <a href="#">Unsubscribe</a> if you don't want to receive these emails.</p>
      </div>
    `;
    
    const text = `Music Events You Might Enjoy\n\nBased on your music preferences, we found these upcoming events that might interest you:\n\n${eventsText}\nCheck them out and create playlists to match the vibe!`;

    return this.sendEmail(to, subject, html, text);
  }

  /**
   * Send playlist generation notification
   * 
   * @param to Recipient email address
   * @param playlistName Name of the generated playlist
   * @param eventName Name of the event
   * @param spotifyUrl Spotify playlist URL
   * @returns Promise with sending result
   */
  async sendPlaylistNotification(to: string, playlistName: string, eventName: string, spotifyUrl: string): Promise<boolean> {
    const subject = 'Your Event Playlist is Ready!';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1DB954;">Your Playlist is Ready!</h2>
        <p>We've created a personalized playlist for you based on the event: <strong>${eventName}</strong></p>
        <div style="background-color: #f4f4f4; padding: 20px; margin: 15px 0; border-radius: 8px;">
          <h3 style="margin-top: 0; color: #333;">${playlistName}</h3>
          <p>This playlist is customized to match the vibe of the event with tracks we think you'll enjoy.</p>
          <a href="${spotifyUrl}" style="display: inline-block; padding: 10px 20px; background-color: #1DB954; color: white; text-decoration: none; border-radius: 50px; font-weight: bold;">
            Listen on Spotify
          </a>
        </div>
        <p>Enjoy the music!</p>
        <hr>
        <p style="font-size: 12px; color: #888;">You received this email because you enabled notifications for playlist generation.</p>
      </div>
    `;
    
    const text = `Your Playlist is Ready!\n\nWe've created a personalized playlist for you based on the event: ${eventName}\n\nPlaylist: ${playlistName}\n\nThis playlist is customized to match the vibe of the event with tracks we think you'll enjoy.\n\nListen on Spotify: ${spotifyUrl}\n\nEnjoy the music!`;

    return this.sendEmail(to, subject, html, text);
  }

  /**
   * Base method to send an email using SendGrid
   * 
   * @param to Recipient email address
   * @param subject Email subject
   * @param html Email HTML content
   * @param text Optional plain text version of the email
   * @returns Promise resolving to success boolean
   */
  async sendEmail(to: string, subject: string, html: string, text?: string): Promise<boolean> {
    // If API key or from email is not set, don't attempt to send
    if (!process.env.SENDGRID_API_KEY || !this.fromEmail) {
      console.error('SendGrid configuration incomplete. Email not sent.');
      return false;
    }

    try {
      const msg = {
        to,
        from: this.fromEmail,
        subject,
        text: text || '',
        html
      };
      
      console.log(`Sending email to ${to} with subject: ${subject}`);
      await mailService.send(msg);
      console.log(`Email sent successfully to ${to}`);
      return true;
    } catch (error) {
      console.error('SendGrid email error:', error);
      return false;
    }
  }
}

// Export a singleton instance
export const emailService = new EmailService();