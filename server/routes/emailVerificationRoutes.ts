import { Router } from 'express';
import { sendVerification, verifyCode } from '../controllers/emailVerificationController';

const router = Router();

/**
 * @route   POST /api/email/verify
 * @desc    Send verification email with code
 * @access  Public
 */
router.post('/verify', sendVerification);

/**
 * @route   POST /api/email/verify/code
 * @desc    Verify email with code
 * @access  Public
 */
router.post('/verify/code', verifyCode);

export default router;