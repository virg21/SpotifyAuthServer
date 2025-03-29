import { Router } from 'express';
import { 
  getMoodBasedEvents,
  getAvailableMoods,
  getEventsByGenre,
  getPersonalizedMoodRecommendations
} from '../controllers/moodController';

const router = Router();

// Get all available moods
router.get('/moods', getAvailableMoods);

// Get events based on mood
router.get('/mood/:mood', getMoodBasedEvents);

// Get events based on genre
router.get('/genre/:genre', getEventsByGenre);

// Get personalized recommendations based on user's music profile
router.get('/personal', getPersonalizedMoodRecommendations);

export default router;