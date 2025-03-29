import express from 'express';
import { getMusicSummary } from '../controllers/musicController';
import { getApiLimiter } from '../middleware/rateLimiter';

const router = express.Router();

/**
 * @route   GET /api/music/summary/:userId?
 * @desc    Get user's music personality summary
 * @access  Private
 */
router.get('/summary/:userId?', getApiLimiter(), getMusicSummary);

export default router;