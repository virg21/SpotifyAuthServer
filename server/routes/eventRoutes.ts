import express from 'express';
import { getEvents } from '../controllers/eventController';

const router = express.Router();

/**
 * @route   GET /api/events?lat=...&lng=...&radius=...&userId=...
 * @desc    Get music events based on location and user preferences
 * @access  Public
 */
router.get('/', getEvents);

export default router;