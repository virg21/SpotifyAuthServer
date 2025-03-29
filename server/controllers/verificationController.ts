import { Request, Response } from 'express';
import { storage } from '../storage';
import { verifyPhoneSchema, verifyCodeSchema } from '@shared/schema';
import { twilioClient } from '../utils/twilioClient';

/**
 * Send verification code to user's phone
 * @route POST /api/verify/phone
 */
export const sendVerificationCode = async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userId || '1');
    
    // Get user to check if they exist
    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Validate request body
    const validation = verifyPhoneSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ 
        message: 'Invalid phone data',
        errors: validation.error.errors
      });
    }
    
    const { phoneNumber } = validation.data;
    
    // Check if Twilio is configured
    if (!twilioClient.isConfigured()) {
      return res.status(503).json({ 
        message: 'Phone verification service is not available',
        error: 'TWILIO_NOT_CONFIGURED'
      });
    }
    
    // Send verification code via Twilio
    const twilioResponse = await twilioClient.sendVerificationCode(phoneNumber);
    
    // Update user's phone number in the database
    await storage.updateUser(userId, { phoneNumber });
    
    res.status(200).json({ 
      message: 'Verification code sent successfully',
      phoneNumber
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
    const userId = parseInt(req.params.userId || '1');
    
    // Get user to check if they exist and have a phone number
    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    if (!user.phoneNumber) {
      return res.status(400).json({ 
        message: 'No phone number found for verification',
        error: 'PHONE_NUMBER_MISSING'
      });
    }
    
    // Validate request body
    const validation = verifyCodeSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ 
        message: 'Invalid verification code',
        errors: validation.error.errors
      });
    }
    
    const { code } = validation.data;
    
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
    
    // Verify code with Twilio
    const verificationCheck = await twilioClient.verifyCode(user.phoneNumber, code);
    
    if (verificationCheck.status === 'approved') {
      // Update user's verified status
      await storage.updateUser(userId, { phoneVerified: true });
      
      res.status(200).json({ 
        message: 'Phone verified successfully',
        verified: true
      });
    } else {
      res.status(400).json({ 
        message: 'Invalid verification code',
        verified: false,
        error: 'INVALID_CODE'
      });
    }
  } catch (error) {
    console.error('Error verifying code:', error);
    res.status(500).json({ message: 'Error verifying code' });
  }
};