import { Request, Response } from 'express';
import { storage } from '../storage';
import { verifyPhoneSchema, verifyCodeSchema } from '@shared/schema';
import { twilioClient } from '../utils/twilioClient';
import { z } from 'zod';

/**
 * Send verification code to user's phone
 * @route POST /api/verify/phone
 */
export const sendVerificationCode = async (req: Request, res: Response) => {
  try {
    // Validate request body
    const validation = verifyPhoneSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ 
        message: 'Invalid phone data',
        errors: validation.error.errors
      });
    }
    
    let { phone } = validation.data;
    
    // Ensure the phone number has the proper format for Twilio
    // Twilio requires phone numbers to be in E.164 format (with + prefix)
    if (!phone.startsWith('+')) {
      phone = `+${phone}`;
    }
    
    // Check if Twilio is configured
    if (!twilioClient.isConfigured()) {
      return res.status(503).json({ 
        message: 'Phone verification service is not available',
        error: 'TWILIO_NOT_CONFIGURED'
      });
    }
    
    let userId = parseInt(req.params.userId || '0');
    let user;
    
    if (userId > 0) {
      user = await storage.getUser(userId);
    }
    
    // If no userId provided or user doesn't exist, create a temporary user
    if (!user) {
      // Generate a random username based on timestamp and random string
      const randomStr = Math.random().toString(36).substring(2, 10);
      const tempUsername = `temp_${Date.now()}_${randomStr}`;
      
      // Create a temporary user with a random password
      // We'll update this later when they complete the full signup
      const tempPassword = Math.random().toString(36).substring(2, 15);
      
      try {
        user = await storage.createUser({
          username: tempUsername,
          password: tempPassword,
          phone: phone,
          phoneVerified: false,
        });
        
        userId = user.id;
        console.log(`Created temporary user with ID: ${userId}`);
      } catch (err) {
        console.error('Error creating temporary user:', err);
        return res.status(500).json({ message: 'Error creating user account' });
      }
    } else {
      // Update existing user's phone number
      await storage.updateUser(userId, { phone });
    }
    
    // Send verification code via Twilio
    const twilioResponse = await twilioClient.sendVerificationCode(phone);
    console.log('Twilio verification response:', twilioResponse);
    
    res.status(200).json({ 
      message: 'Verification code sent successfully',
      phone,
      userId: user.id
    });
  } catch (error) {
    console.error('Error sending verification code:', error);
    res.status(500).json({ message: 'Error sending verification code' });
  }
};

/**
 * Verify code sent to user's phone
 * @route POST /api/verify/code
 */
export const verifyCode = async (req: Request, res: Response) => {
  try {
    // Modify verifyCodeSchema to make email optional
    const validation = z.object({
      code: z.string()
    }).safeParse(req.body);
    
    if (!validation.success) {
      return res.status(400).json({ 
        message: 'Invalid verification code',
        errors: validation.error.errors
      });
    }
    
    const { code } = validation.data;
    
    const userId = parseInt(req.params.userId || '1');
    
    // Get user to check if they exist and have a phone number
    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    if (!user.phone) {
      return res.status(400).json({ 
        message: 'No phone number found for verification',
        error: 'PHONE_NUMBER_MISSING'
      });
    }
    
    // Ensure the phone number has the proper format for Twilio
    let userPhone = user.phone;
    if (!userPhone.startsWith('+')) {
      userPhone = `+${userPhone}`;
      // Update the user's phone number in the database with the corrected format
      await storage.updateUser(userId, { phone: userPhone });
    }
    
    // For development and testing environment
    // Always allow "123456" as a valid verification code
    if (process.env.NODE_ENV !== 'production' && code === '123456') {
      console.log('Using development mode verification for testing');
      await storage.updateUser(userId, { phoneVerified: true });
      return res.status(200).json({ 
        message: 'Phone verified successfully (development mode)',
        verified: true
      });
    }
    
    // Check if Twilio is configured
    if (!twilioClient.isConfigured()) {
      // If Twilio is not configured, we'll use a mock verification
      // In production, this should always verify with Twilio
      if (code === '123456') {
        await storage.updateUser(userId, { phoneVerified: true });
        return res.status(200).json({ 
          message: 'Phone verified successfully (mock verification)',
          verified: true
        });
      } else {
        return res.status(400).json({ 
          message: 'Invalid verification code (mock verification)',
          verified: false,
          error: 'INVALID_CODE'
        });
      }
    }
    
    try {
      // Verify code with Twilio
      const verificationCheck = await twilioClient.verifyCode(userPhone, code);
      console.log('Twilio verification check:', verificationCheck);
      
      if (verificationCheck.status === 'approved') {
        // Update user's verified status
        await storage.updateUser(userId, { phoneVerified: true });
        
        return res.status(200).json({ 
          message: 'Phone verified successfully',
          verified: true
        });
      } else {
        return res.status(400).json({ 
          message: 'Invalid verification code',
          verified: false,
          error: 'INVALID_CODE'
        });
      }
    } catch (twilioError) {
      console.error('Twilio verification error:', twilioError);
      
      // For development and testing, allow verification with the hardcoded code
      if (process.env.NODE_ENV !== 'production' && code === '123456') {
        console.log('Falling back to development mode verification after Twilio error');
        await storage.updateUser(userId, { phoneVerified: true });
        return res.status(200).json({ 
          message: 'Phone verified successfully (development fallback)',
          verified: true
        });
      }
      
      throw twilioError; // Re-throw for the outer catch block
    }
  } catch (error) {
    console.error('Error verifying code:', error);
    
    // Final fallback for development mode
    if (process.env.NODE_ENV !== 'production' && req.body.code === '123456') {
      const userId = parseInt(req.params.userId);
      console.log('Ultimate fallback: Verifying phone with development mode');
      await storage.updateUser(userId, { phoneVerified: true });
      return res.status(200).json({ 
        message: 'Phone verified successfully (ultimate fallback)',
        verified: true
      });
    }
    
    res.status(500).json({ message: 'Error verifying code' });
  }
};