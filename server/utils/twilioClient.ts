import { getEnv } from '../config/env';
import twilio from 'twilio';

/**
 * Utility class for Twilio API interactions
 * Handles phone verification via SMS
 */
export class TwilioClient {
  private accountSid: string;
  private authToken: string;
  private verifySid: string;
  private client: any;

  constructor() {
    this.accountSid = getEnv('TWILIO_ACCOUNT_SID', false);
    this.authToken = getEnv('TWILIO_AUTH_TOKEN', false);
    this.verifySid = getEnv('TWILIO_VERIFY_SERVICE_SID', false);
    
    if (this.isConfigured()) {
      // Initialize Twilio client
      this.client = twilio(this.accountSid, this.authToken);
    }
  }

  /**
   * Check if Twilio is configured
   */
  isConfigured(): boolean {
    return Boolean(this.accountSid && this.authToken && this.verifySid);
  }

  /**
   * Send verification code to a phone number
   * @param phoneNumber The phone number to send verification to
   * @returns Response from Twilio or mock data if Twilio is not configured
   */
  async sendVerificationCode(phoneNumber: string): Promise<any> {
    if (!this.isConfigured()) {
      console.log(`[MOCK] Sending verification code to ${phoneNumber}`);
      return {
        status: 'pending',
        to: phoneNumber,
        channel: 'sms'
      };
    }
    
    try {
      return await this.client.verify.v2.services(this.verifySid)
        .verifications
        .create({ to: phoneNumber, channel: 'sms' });
    } catch (error) {
      console.error('Twilio API error:', error);
      throw error;
    }
  }

  /**
   * Verify code submitted by user
   * @param phoneNumber The phone number to verify
   * @param code The verification code entered by user
   * @returns Result of verification check
   */
  async verifyCode(phoneNumber: string, code: string): Promise<any> {
    if (!this.isConfigured()) {
      console.log(`[MOCK] Verifying code ${code} for ${phoneNumber}`);
      // In mock mode, we'll consider "123456" as the valid code
      return {
        status: code === '123456' ? 'approved' : 'rejected',
        to: phoneNumber
      };
    }
    
    try {
      return await this.client.verify.v2.services(this.verifySid)
        .verificationChecks
        .create({ to: phoneNumber, code });
    } catch (error) {
      console.error('Twilio API error:', error);
      throw error;
    }
  }
}

export const twilioClient = new TwilioClient();