import { Router } from 'express';
import { register, login, getCurrentUser, updatePreferences } from '../controllers/auth.controller';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post('/register', register);

/**
 * @route   POST /api/auth/login
 * @desc    Login an existing user
 * @access  Public
 */
router.post('/login', login);

/**
 * @route   GET /api/auth/me
 * @desc    Get current authenticated user
 * @access  Private
 */
router.get('/me', requireAuth, getCurrentUser);

/**
 * @route   PATCH /api/auth/preferences
 * @desc    Update user preferences (character variant)
 * @access  Private
 */
router.patch('/preferences', requireAuth, updatePreferences);

export default router;
