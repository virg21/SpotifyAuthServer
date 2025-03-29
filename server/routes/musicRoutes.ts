import express from 'express';
import { getMusicSummary } from '../controllers/musicController';

const router = express.Router();

/**
 * @route   GET /api/music/summary/:userId?
 * @desc    Get user's music personality summary
 * @access  Private
 */
router.get('/summary/:userId?', getMusicSummary);

export default router;