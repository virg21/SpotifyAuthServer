import { Request, Response } from 'express';
import { storage } from '../storage';
import { updateUserLocationSchema, updateNotificationsSchema, updateUserProfileSchema } from '@shared/schema';

/**
 * Get user profile information
 * @route GET /api/user/profile
 */
export const getUserProfile = async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userId || '1');
    
    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Don't return sensitive information
    const { password, ...userProfile } = user;
    
    res.status(200).json(userProfile);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ message: 'Error fetching user profile' });
  }
};

/**
 * Update user's location
 * @route POST /api/user/location
 */
export const updateUserLocation = async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userId || '1');
    
    // Validate request body
    const validation = updateUserLocationSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ 
        message: 'Invalid location data',
        errors: validation.error.errors
      });
    }
    
    const { latitude, longitude } = validation.data;
    
    const updatedUser = await storage.updateUserLocation(userId, latitude, longitude);
    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.status(200).json({ 
      message: 'Location updated successfully',
      location: {
        latitude: updatedUser.latitude,
        longitude: updatedUser.longitude
      }
    });
  } catch (error) {
    console.error('Error updating user location:', error);
    res.status(500).json({ message: 'Error updating user location' });
  }
};

/**
 * Update notification preferences
 * @route POST /api/user/notifications
 */
export const updateNotifications = async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userId || '1');
    
    // Validate request body
    const validation = updateNotificationsSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ 
        message: 'Invalid notification data',
        errors: validation.error.errors
      });
    }
    
    const { notificationsEnabled } = validation.data;
    
    const updatedUser = await storage.updateUserNotifications(userId, notificationsEnabled);
    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.status(200).json({ 
      message: 'Notification preferences updated successfully',
      notificationsEnabled: updatedUser.notificationsEnabled
    });
  } catch (error) {
    console.error('Error updating notification preferences:', error);
    res.status(500).json({ message: 'Error updating notification preferences' });
  }
};

/**
 * Get all users
 * @route GET /api/users
 */
export const getUsers = async (req: Request, res: Response) => {
  try {
    const users = await storage.getUsers();
    
    // Remove sensitive information like passwords
    const safeUsers = users.map(user => {
      const { password, ...safeUser } = user;
      return safeUser;
    });
    
    res.status(200).json({
      users: safeUsers,
      count: safeUsers.length
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Error fetching users' });
  }
};

/**
 * Update user profile information
 * @route PATCH /api/user/profile
 */
export const updateUserProfile = async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userId || '1');
    
    // Validate request body
    const validation = updateUserProfileSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ 
        message: 'Invalid profile data',
        errors: validation.error.errors
      });
    }
    
    const profileData = validation.data;
    
    const updatedUser = await storage.updateUser(userId, profileData);
    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Don't return sensitive information
    const { password, ...userProfile } = updatedUser;
    
    res.status(200).json({ 
      message: 'Profile updated successfully',
      user: userProfile
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ message: 'Error updating user profile' });
  }
};