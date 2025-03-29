import { Router } from 'express';
import { getEvents, triggerScraping, getScraperStatus, createTestEvent } from '../controllers/eventController';
import { getStandardLimiter, getApiLimiter } from '../middleware/rateLimiter';

const router = Router();

/**
 * @route   GET /api/events?lat=...&lng=...&radius=...&userId=...
 * @desc    Get music events based on location and user preferences
 * @access  Public
 */
router.get('/', getStandardLimiter(), getEvents);

/**
 * @route   POST /api/events/test
 * @desc    Create a test event
 * @access  Public (for testing)
 */
router.post('/test', getStandardLimiter(), createTestEvent);

/**
 * @route   POST /api/events/scrape
 * @desc    Manually trigger the event scraping process
 * @access  Admin
 */
router.post('/scrape', getApiLimiter(), triggerScraping);

/**
 * @route   GET /api/events/scrape/status
 * @desc    Get status of the scraper manager
 * @access  Admin
 */
router.get('/scrape/status', getApiLimiter(), getScraperStatus);

export default router;