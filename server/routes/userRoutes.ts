import express from 'express';
import { getUserProfile, updateUserLocation, updateNotifications } from '../controllers/userController';

const router = express.Router();

/**
 * @route   GET /api/user/profile/:userId?
 * @desc    Get user profile information
 * @access  Private
 */
router.get('/profile/:userId?', getUserProfile);

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