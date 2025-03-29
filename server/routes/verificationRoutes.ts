import express from 'express';
import { sendVerificationCode, verifyCode } from '../controllers/verificationController';

const router = express.Router();

/**
 * @route   POST /api/verify/phone/:userId?
 * @desc    Send verification code to user's phone
 * @access  Private
 */
router.post('/phone/:userId?', sendVerificationCode);

/**
 * @route   POST /api/verify/code/:userId?
 * @desc    Verify code sent to user's phone
 * @access  Private
 */
router.post('/code/:userId?', verifyCode);

export default router;