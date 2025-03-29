import { Request, Response } from 'express';
import { storage } from '../storage';
import { emailService } from '../utils/emailService';
import { verifyCodeSchema } from '../../shared/schema';
import { z } from 'zod';

/**
 * Generate and send verification code to user's email
 * @route POST /api/auth/email/send-verification
 */
export const sendVerificationCode = async (req: Request, res: Response) => {
  try {
    // Validate request body
    const emailSchema = z.object({
      email: z.string().email()
    });
    
    const validationResult = emailSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        message: 'Invalid email address',
        errors: validationResult.error.errors
      });
    }
    
    const { email } = validationResult.data;
    
    // Check if user exists with this email
    const user = await storage.getUserByEmail(email);
    if (!user) {
      return res.status(404).json({
        message: 'No user found with this email address'
      });
    }
    
    // Check if email is already verified
    if (user.emailVerified) {
      return res.status(400).json({
        message: 'Email is already verified'
      });
    }
    
    // Generate a random 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Set expiration time (30 minutes from now)
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 30);
    
    // Save verification code to database
    await storage.saveVerificationCode(user.id, code, expiresAt);
    
    // Send verification email
    const emailSent = await emailService.sendVerificationCode(email, code);
    
    if (!emailSent) {
      return res.status(500).json({
        message: 'Failed to send verification email'
      });
    }
    
    // Return success response
    res.status(200).json({
      message: 'Verification code sent to your email',
      expiresAt
    });
  } catch (error) {
    console.error('Error sending verification code:', error);
    res.status(500).json({
      message: 'Failed to send verification code',
      error: (error as Error).message
    });
  }
};

/**
 * Verify email with verification code
 * @route POST /api/auth/email/verify
 */
export const verifyEmailCode = async (req: Request, res: Response) => {
  try {
    // Validate request body
    const validationResult = verifyCodeSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        message: 'Invalid verification data',
        errors: validationResult.error.errors
      });
    }
    
    const { email, code } = validationResult.data;
    
    // Get user by email
    const user = await storage.getUserByEmail(email);
    if (!user) {
      return res.status(404).json({
        message: 'No user found with this email address'
      });
    }
    
    // Check if already verified
    if (user.emailVerified) {
      return res.status(400).json({
        message: 'Email is already verified'
      });
    }
    
    // Get verification code from database
    const verificationCode = await storage.getVerificationCode(user.id, code);
    
    if (!verificationCode) {
      return res.status(404).json({
        message: 'Invalid verification code'
      });
    }
    
    // Check if code is expired
    if (new Date() > new Date(verificationCode.expiresAt)) {
      return res.status(400).json({
        message: 'Verification code has expired'
      });
    }
    
    // Mark code as verified
    await storage.markVerificationCodeAsVerified(verificationCode.id);
    
    // Mark user email as verified
    const updatedUser = await storage.markUserEmailAsVerified(user.id);
    
    if (!updatedUser) {
      return res.status(500).json({
        message: 'Failed to verify email'
      });
    }
    
    // Send welcome email
    const displayName = user.displayName || user.username;
    emailService.sendWelcomeEmail(email, displayName).catch(err => {
      console.error('Failed to send welcome email:', err);
    });
    
    // Return success response
    res.status(200).json({
      message: 'Email verified successfully',
      user: {
        id: updatedUser.id,
        username: updatedUser.username,
        displayName: updatedUser.displayName,
        email: updatedUser.email,
        emailVerified: updatedUser.emailVerified
      }
    });
  } catch (error) {
    console.error('Error verifying email:', error);
    res.status(500).json({
      message: 'Failed to verify email',
      error: (error as Error).message
    });
  }
};