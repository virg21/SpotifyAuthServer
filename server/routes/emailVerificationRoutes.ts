import express from 'express';
import { sendVerificationCode, verifyEmailCode } from '../controllers/emailVerificationController';

const router = express.Router();

// Send verification code email
router.post('/send-verification', sendVerificationCode);

// Verify email with code
router.post('/verify', verifyEmailCode);

export default router;