import { Router } from 'express';
import { 
  getMoodBasedEvents,
  getAvailableMoods,
  getEventsByGenre,
  getPersonalizedMoodRecommendations
} from '../controllers/moodController';
import { getStandardLimiter, getApiLimiter } from '../middleware/rateLimiter';

const router = Router();

// Get all available moods
router.get('/moods', getStandardLimiter(), getAvailableMoods);

// Get events based on mood
router.get('/mood/:mood', getStandardLimiter(), getMoodBasedEvents);

// Get events based on genre
router.get('/genre/:genre', getStandardLimiter(), getEventsByGenre);

// Get personalized recommendations based on user's music profile
router.get('/personal', getApiLimiter(), getPersonalizedMoodRecommendations);

export default router;