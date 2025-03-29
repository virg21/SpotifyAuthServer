import { Request, Response } from 'express';
import { storage } from '../storage';
import { z } from 'zod';
import { sendVerificationEmail } from '../utils/emailService';

// Email validation schema
const emailSchema = z.object({
  email: z.string().email()
});

// Verification code schema
const verifyCodeSchema = z.object({
  email: z.string().email(),
  code: z.string().min(6).max(6)
});

/**
 * Generate a random 6-digit verification code
 */
function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Send email verification code
 * @route POST /api/email/verify
 */
export const sendVerification = async (req: Request, res: Response) => {
  try {
    // Validate email
    const validation = emailSchema.safeParse(req.body);
    
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email address',
        errors: validation.error.errors
      });
    }
    
    const { email } = validation.data;
    
    // Check if email already exists and is verified
    const existingUser = await storage.getUserByEmail(email);
    
    if (existingUser && existingUser.emailVerified) {
      return res.status(400).json({
        success: false,
        message: 'Email is already verified'
      });
    }
    
    // Generate a verification code
    const code = generateVerificationCode();
    
    // Store the verification code
    // Code expires in 30 minutes
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000);
    
    if (existingUser) {
      await storage.saveVerificationCode(existingUser.id, code, expiresAt);
    } else {
      // If user doesn't exist yet, create a temporary verification code
      // This will be associated with the user upon registration
      const tempUser = await storage.createUser({
        username: `temp-${Date.now()}`,
        password: `temp-${Math.random().toString(36).substring(2, 15)}`, // Temporary password
        email,
        emailVerified: false,
        phoneVerified: false,
        notificationsEnabled: false
      });
      
      await storage.saveVerificationCode(tempUser.id, code, expiresAt);
    }
    
    // Send verification email
    const sent = await sendVerificationEmail(email, code);
    
    if (!sent) {
      return res.status(500).json({
        success: false,
        message: 'Failed to send verification email'
      });
    }
    
    return res.json({
      success: true,
      message: 'Verification email sent'
    });
  } catch (error) {
    console.error('Error sending verification email:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: (error as Error).message
    });
  }
};

/**
 * Verify email with code
 * @route POST /api/email/verify/code
 */
export const verifyCode = async (req: Request, res: Response) => {
  try {
    // Validate request
    const validation = verifyCodeSchema.safeParse(req.body);
    
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: 'Invalid request data',
        errors: validation.error.errors
      });
    }
    
    const { email, code } = validation.data;
    
    // Find the user
    const user = await storage.getUserByEmail(email);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Check if the code is valid
    const verificationCode = await storage.getVerificationCode(user.id, code);
    
    if (!verificationCode) {
      return res.status(400).json({
        success: false,
        message: 'Invalid verification code'
      });
    }
    
    // Check if the code has expired
    if (verificationCode.expiresAt < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Verification code has expired'
      });
    }
    
    // Check if the code is already verified
    if (verificationCode.verified) {
      return res.status(400).json({
        success: false,
        message: 'Code already used'
      });
    }
    
    // Mark the code as verified
    await storage.markVerificationCodeAsVerified(verificationCode.id);
    
    // Mark the user's email as verified
    const updatedUser = await storage.markUserEmailAsVerified(user.id);
    
    if (!updatedUser) {
      return res.status(500).json({
        success: false,
        message: 'Failed to update user'
      });
    }
    
    return res.json({
      success: true,
      message: 'Email verified successfully',
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        emailVerified: updatedUser.emailVerified
      }
    });
  } catch (error) {
    console.error('Error verifying email:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: (error as Error).message
    });
  }
};