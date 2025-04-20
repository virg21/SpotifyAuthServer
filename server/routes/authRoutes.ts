import { Router } from 'express';
import * as authController from '../controllers/authController';
import * as verificationController from '../controllers/verificationController';

const router = Router();

// Phone verification routes
router.post('/phone/send-verification', verificationController.sendVerificationCode);
router.post('/phone/verify', verificationController.verifyCode);

// Spotify OAuth routes
router.get('/spotify/login', authController.initiateSpotifyLogin);
router.get('/spotify/callback', authController.handleSpotifyCallback);
// Also add the callback route without the 'spotify/' prefix to match what's in the Spotify Dashboard
router.get('/callback', authController.handleSpotifyCallback);
router.post('/spotify/refresh', authController.refreshSpotifyToken);

// User authentication routes
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.get('/me', authController.getCurrentUser);

// Testing utility routes - NOT FOR PRODUCTION
if (process.env.NODE_ENV !== 'production') {
  router.post('/direct-update-user', authController.directUpdateUser);
  router.get('/test-spotify-connectivity', authController.testSpotifyConnectivity);
  router.get('/spotify/login-url', authController.getSpotifyLoginUrl);
}

export default router;