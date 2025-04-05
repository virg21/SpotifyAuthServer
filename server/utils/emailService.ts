import sgMail from '@sendgrid/mail';

// Initialize SendGrid with API key
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

// Use verified sender email from environment variable
const fromEmail = process.env.SENDGRID_FROM_EMAIL || 'noreply@quincy.example.com';

interface EmailResult {
  success: boolean;
  error?: Error;
}

class EmailService {
  /**
   * Send verification code to user's email
   */
  async sendVerificationCode(to: string, code: string): Promise<boolean> {
    if (!process.env.SENDGRID_API_KEY) {
      console.warn('SendGrid API key not set. Skipping email sending.');
      return false;
    }

    try {
      const msg = {
        to,
        from: fromEmail,
        subject: 'Verify your email address for Quincy',
        text: `Your verification code is: ${code}. It expires in 15 minutes.`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #00442C; text-align: center;">Quincy Email Verification</h2>
            <div style="background-color: #f9f9f9; padding: 20px; border-radius: 5px; margin-top: 20px;">
              <p>Your verification code is:</p>
              <h1 style="color: #F73E7C; text-align: center; font-size: 32px; letter-spacing: 5px;">${code}</h1>
              <p style="color: #777; font-size: 14px;">This code will expire in 15 minutes.</p>
            </div>
            <p style="margin-top: 20px;">
              Thank you for joining Quincy, where we connect your music taste to your city's scene.
            </p>
          </div>
        `,
      };

      await sgMail.send(msg);
      return true;
    } catch (error) {
      console.error('Error sending verification email:', error);
      return false;
    }
  }

  /**
   * Send email about new event recommendations
   */
  async sendEventRecommendations(to: string, events: any[]): Promise<boolean> {
    if (!process.env.SENDGRID_API_KEY) {
      console.warn('SendGrid API key not set. Skipping email sending.');
      return false;
    }

    try {
      // Create HTML for event listings
      let eventsHtml = '';
      events.forEach(event => {
        eventsHtml += `
          <div style="margin-bottom: 20px; border-left: 3px solid #F73E7C; padding-left: 15px;">
            <h3 style="margin: 0; color: #00442C;">${event.name}</h3>
            <p style="margin: 5px 0; color: #666;">
              <strong>Where:</strong> ${event.venue}
            </p>
            <p style="margin: 5px 0; color: #666;">
              <strong>When:</strong> ${new Date(event.date).toLocaleString('en-US', { 
                month: 'short', 
                day: 'numeric', 
                year: 'numeric',
                hour: 'numeric',
                minute: '2-digit'
              })}
            </p>
            ${event.ticketUrl ? `<a href="${event.ticketUrl}" style="display: inline-block; background-color: #F73E7C; color: white; padding: 8px 15px; text-decoration: none; border-radius: 4px; margin-top: 10px;">Get Tickets</a>` : ''}
          </div>
        `;
      });

      const msg = {
        to,
        from: fromEmail,
        subject: 'New Music Events Just for You!',
        text: `Check out these ${events.length} music events we found based on your taste!`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #00442C; text-align: center;">Events Picked Just For You!</h2>
            <p>Based on your music taste, we think you'll love these upcoming events:</p>
            
            <div style="margin-top: 25px;">
              ${eventsHtml}
            </div>
            
            <div style="margin-top: 30px; text-align: center;">
              <a href="${process.env.APP_URL || 'https://quincy.example.com'}/events" style="background-color: #00442C; color: white; padding: 12px 20px; text-decoration: none; border-radius: 4px; font-weight: bold;">See All Recommended Events</a>
            </div>
            
            <p style="color: #999; font-size: 12px; margin-top: 30px; text-align: center;">
              You're receiving this because you enabled event notifications in Quincy.
              <br>
              <a href="${process.env.APP_URL || 'https://quincy.example.com'}/settings" style="color: #999;">Update your notification preferences</a>
            </p>
          </div>
        `,
      };

      await sgMail.send(msg);
      return true;
    } catch (error) {
      console.error('Error sending event recommendations email:', error);
      return false;
    }
  }

  /**
   * Send notification about playlist creation
   */
  async sendPlaylistNotification(to: string, playlistName: string, eventName: string, playlistUrl: string): Promise<boolean> {
    if (!process.env.SENDGRID_API_KEY) {
      console.warn('SendGrid API key not set. Skipping email sending.');
      return false;
    }

    try {
      const msg = {
        to,
        from: fromEmail,
        subject: `Your New "${playlistName}" Playlist is Ready!`,
        text: `Your playlist for ${eventName} is ready! Check it out on Spotify: ${playlistUrl}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #00442C; text-align: center;">Your Playlist is Ready!</h2>
            
            <div style="background-color: #f9f9f9; padding: 25px; border-radius: 8px; margin-top: 20px; border-left: 5px solid #1DB954;">
              <h3 style="margin-top: 0; color: #1DB954;">✓ Created on Spotify</h3>
              <h2 style="margin: 5px 0 15px; color: #00442C;">${playlistName}</h2>
              <p style="margin: 0 0 20px; color: #666;">For event: <strong>${eventName}</strong></p>
              
              <a href="${playlistUrl}" style="display: inline-block; background-color: #1DB954; color: white; padding: 12px 20px; text-decoration: none; border-radius: 25px; font-weight: bold;">
                Listen on Spotify
              </a>
            </div>
            
            <p style="margin-top: 25px; text-align: center;">
              Get ready for the event by listening to this personalized playlist we created just for you!
            </p>
            
            <div style="margin-top: 30px; text-align: center;">
              <a href="${process.env.APP_URL || 'https://quincy.example.com'}/events" style="background-color: #00442C; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">Find More Events</a>
            </div>
            
            <p style="color: #999; font-size: 12px; margin-top: 30px; text-align: center;">
              You're receiving this because you created a playlist on Quincy.
            </p>
          </div>
        `,
      };

      await sgMail.send(msg);
      return true;
    } catch (error) {
      console.error('Error sending playlist notification email:', error);
      return false;
    }
  }
}

export const emailService = new EmailService();