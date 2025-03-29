import express from 'express';
import { sendVerificationCode, verifyEmailCode } from '../controllers/emailVerificationController';
import { getVerificationLimiter } from '../middleware/rateLimiter';

const router = express.Router();

// Send verification code email
router.post('/send-verification', getVerificationLimiter(), sendVerificationCode);

// Verify email with code
router.post('/verify', getVerificationLimiter(), verifyEmailCode);

export default router;