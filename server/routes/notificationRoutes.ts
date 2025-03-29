import express from 'express';
import { 
  sendEventRecommendations,
  broadcastEventRecommendations
} from '../controllers/notificationController';
import { getApiLimiter } from '../middleware/rateLimiter';

const router = express.Router();

/**
 * @route   POST /api/notifications/events/broadcast
 * @desc    Send personalized event recommendations to all subscribed users
 * @access  Admin only
 */
router.post('/events/broadcast', getApiLimiter(), broadcastEventRecommendations);

/**
 * @route   POST /api/notifications/events/:userId
 * @desc    Send personalized event recommendations to a specific user
 * @access  Private (User or Admin)
 */
router.post('/events/:userId', getApiLimiter(), sendEventRecommendations);

export default router;