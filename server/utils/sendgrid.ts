import { MailService } from '@sendgrid/mail';

// Initialize mail service but don't throw an error if key is missing
// We'll handle that gracefully in the sendEmail function
const mailService = new MailService();

// Set the API key if it exists
if (process.env.SENDGRID_API_KEY) {
  mailService.setApiKey(process.env.SENDGRID_API_KEY);
} else {
  console.warn("SENDGRID_API_KEY environment variable not set. Email functionality will be disabled.");
}

interface EmailParams {
  to: string;
  from: string;
  subject: string;
  text?: string;
  html?: string;
}

/**
 * Send an email using SendGrid service
 * @param apiKey SendGrid API key
 * @param params Email parameters including to, from, subject, text/html content
 * @returns Promise resolving to boolean indicating success/failure
 */
export async function sendEmail(
  apiKey: string,
  params: EmailParams
): Promise<boolean> {
  try {
    if (!process.env.SENDGRID_API_KEY) {
      console.error('SENDGRID_API_KEY environment variable must be set');
      return false;
    }

    if (!process.env.SENDGRID_FROM_EMAIL && !params.from) {
      console.error('No sender email specified: SENDGRID_FROM_EMAIL environment variable or params.from must be set');
      return false;
    }

    // Use the provided from or the default from environment variable
    const fromEmail = params.from || process.env.SENDGRID_FROM_EMAIL || '';

    if (!fromEmail) {
      console.error('No sender email available');
      return false;
    }
    
    await mailService.send({
      to: params.to,
      from: fromEmail,
      subject: params.subject,
      text: params.text || '',
      html: params.html || '',
    });
    
    console.log(`Email sent successfully to ${params.to}`);
    return true;
  } catch (error) {
    console.error('SendGrid email error:', error);
    return false;
  }
}

/**
 * Helper function to send a verification code email
 * @param to Recipient email address
 * @param code Verification code
 * @returns Promise resolving to boolean indicating success/failure
 */
export async function sendVerificationEmail(to: string, code: string): Promise<boolean> {
  const fromEmail = process.env.SENDGRID_FROM_EMAIL || '';
  const apiKey = process.env.SENDGRID_API_KEY || '';
  
  if (!fromEmail) {
    console.error('SENDGRID_FROM_EMAIL environment variable must be set');
    return false;
  }
  
  if (!apiKey) {
    console.error('SENDGRID_API_KEY environment variable must be set');
    return false;
  }
  
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

  return sendEmail(apiKey, {
    to,
    from: fromEmail,
    subject,
    text,
    html
  });
}

/**
 * Helper function to send a playlist notification email
 * @param to Recipient email address
 * @param playlistName Name of the generated playlist
 * @param eventName Name of the event
 * @param spotifyUrl URL to the Spotify playlist
 * @returns Promise resolving to boolean indicating success/failure
 */
export async function sendPlaylistNotificationEmail(
  to: string, 
  playlistName: string, 
  eventName: string, 
  spotifyUrl: string
): Promise<boolean> {
  const fromEmail = process.env.SENDGRID_FROM_EMAIL || '';
  const apiKey = process.env.SENDGRID_API_KEY || '';
  
  if (!fromEmail) {
    console.error('SENDGRID_FROM_EMAIL environment variable must be set');
    return false;
  }
  
  if (!apiKey) {
    console.error('SENDGRID_API_KEY environment variable must be set');
    return false;
  }
  
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

  return sendEmail(apiKey, {
    to,
    from: fromEmail,
    subject,
    text,
    html
  });
}