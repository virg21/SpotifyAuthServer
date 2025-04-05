import express from 'express';
import { generatePlaylist, getUserPlaylists, getPlaylist, getEventPlaylists, deletePlaylist } from '../controllers/playlistController';
import { requireAuth } from '../middleware/authMiddleware';

const router = express.Router();

// Protected routes (require authentication)
router.post('/generate', requireAuth, generatePlaylist);
router.get('/', requireAuth, getUserPlaylists);
router.get('/:id', getPlaylist); // Allows public access with visibility control
router.delete('/:id', requireAuth, deletePlaylist);

// Event related playlist routes
router.get('/event/:eventId', getEventPlaylists);

export default router;