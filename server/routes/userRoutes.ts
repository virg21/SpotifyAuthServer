import express from 'express';
import { 
  getUserProfile, 
  updateUserLocation, 
  updateNotifications, 
  getUsers,
  updateUserProfile
} from '../controllers/userController';

const router = express.Router();

/**
 * @route   GET /api/user
 * @desc    Get all users
 * @access  Private
 */
router.get('/', getUsers);

/**
 * @route   GET /api/user/profile/:userId?
 * @desc    Get user profile information
 * @access  Private
 */
router.get('/profile/:userId?', getUserProfile);

/**
 * @route   PATCH /api/user/profile/:userId?
 * @desc    Update user profile information
 * @access  Private
 */
router.patch('/profile/:userId?', updateUserProfile);

/**
 * @route   POST /api/user/location/:userId?
 * @desc    Update user's location
 * @access  Private
 */
router.post('/location/:userId?', updateUserLocation);

/**
 * @route   POST /api/user/notifications/:userId?
 * @desc    Enable or disable notifications
 * @access  Private
 */
router.post('/notifications/:userId?', updateNotifications);

export default router;