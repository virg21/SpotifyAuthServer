import { MailService } from '@sendgrid/mail';
import { getEnv } from '../config/env';

// Initialize SendGrid client
const mailService = new MailService();

// Try to get API key from environment
try {
  const apiKey = getEnv('SENDGRID_API_KEY', false);
  if (apiKey) {
    mailService.setApiKey(apiKey);
    console.log('SendGrid API key configured');
  } else {
    console.warn('SendGrid API key not set. Email functionality will be disabled.');
  }
} catch (error) {
  console.warn('SendGrid API key not found in environment variables');
}

export interface EmailOptions {
  to: string;
  from: string;
  subject: string;
  text?: string;
  html?: string;
  templateId?: string;
  dynamicTemplateData?: Record<string, any>;
}

/**
 * Sends an email using SendGrid
 * @param options Email options
 * @returns True if email was sent successfully, false otherwise
 */
export async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    if (!process.env.SENDGRID_API_KEY) {
      console.warn('Cannot send email: SendGrid API key not set');
      return false;
    }
    
    // Log email attempt
    console.log(`Attempting to send email from ${options.from} to ${options.to} with subject: ${options.subject}`);
    
    // Create the message object with only defined properties
    const message: any = {
      to: options.to,
      from: options.from,
      subject: options.subject
    };
    
    // Only add properties that are defined
    if (options.text) message.text = options.text;
    if (options.html) message.html = options.html;
    if (options.templateId) message.templateId = options.templateId;
    if (options.dynamicTemplateData) message.dynamicTemplateData = options.dynamicTemplateData;
    
    // Ensure we have either text or html content
    if (!message.text && !message.html && !message.templateId) {
      console.error('Email must have text, HTML content, or a template ID');
      return false;
    }
    
    await mailService.send(message);
    
    console.log(`Email successfully sent to ${options.to}`);
    return true;
  } catch (error: any) {
    // Provide more detailed error information
    console.error('Error sending email:', error);
    
    // Log specific SendGrid error information if available
    if (error.response && error.response.body && error.response.body.errors) {
      console.error('SendGrid API errors:', JSON.stringify(error.response.body.errors));
    }
    
    if (error.code === 403) {
      console.error('SendGrid authorization failed. This may be due to:');
      console.error('1. The API key not having sufficient permissions');
      console.error('2. The "from" email address not being verified in SendGrid');
      console.error('3. Account restrictions on your SendGrid account');
    }
    
    return false;
  }
}

/**
 * Sends a verification email with code
 * @param email Recipient email
 * @param code Verification code
 * @returns True if email was sent successfully, false otherwise
 */
export async function sendVerificationEmail(email: string, code: string): Promise<boolean> {
  // Use a verified sender email that matches your SendGrid account
  // The SENDGRID_FROM_EMAIL should be an email that's verified in your SendGrid account
  // If not provided, fall back to a default that is likely to work with sandbox accounts
  const from = getEnv('SENDGRID_FROM_EMAIL', false) || 'test@example.com';
  console.log(`Sending verification email from: ${from} to: ${email}`);
  
  return sendEmail({
    to: email,
    from,
    subject: 'Verify Your Email',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Email Verification</h2>
        <p>Thank you for signing up! Please use the following code to verify your email address:</p>
        <div style="background-color: #f4f4f4; padding: 12px; border-radius: 4px; text-align: center; margin: 16px 0;">
          <h3 style="font-size: 24px; letter-spacing: 2px; margin: 0;">${code}</h3>
        </div>
        <p>This code will expire in 30 minutes.</p>
        <p>If you didn't request this verification, please ignore this email.</p>
      </div>
    `
  });
}

/**
 * Sends a password reset email with link
 * @param email Recipient email
 * @param resetToken Reset token
 * @returns True if email was sent successfully, false otherwise
 */
export async function sendPasswordResetEmail(email: string, resetToken: string): Promise<boolean> {
  // Use a verified sender email that matches your SendGrid account
  const from = getEnv('SENDGRID_FROM_EMAIL', false) || 'test@example.com';
  const baseUrl = getEnv('BASE_URL', false) || 'http://localhost:3000';
  console.log(`Sending password reset email from: ${from} to: ${email}`);
  
  return sendEmail({
    to: email,
    from,
    subject: 'Reset Your Password',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Password Reset</h2>
        <p>You requested to reset your password. Please click the link below to create a new password:</p>
        <div style="margin: 24px 0;">
          <a href="${baseUrl}/reset-password?token=${resetToken}" 
             style="background-color: #4F46E5; color: white; padding: 12px 20px; border-radius: 4px; text-decoration: none; display: inline-block;">
            Reset Password
          </a>
        </div>
        <p>This link will expire in 30 minutes.</p>
        <p>If you didn't request a password reset, please ignore this email.</p>
      </div>
    `
  });
}