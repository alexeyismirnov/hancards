import { Router } from 'express';
import {
  getDueCards,
  submitReview,
  startSession,
  endSession,
  getDeckStats,
} from '../controllers/review.controller';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();

/**
 * @route   GET /api/decks/:deckId/review/due
 * @desc    Get due cards for review
 * @access  Private
 */
router.get('/decks/:deckId/review/due', requireAuth, getDueCards);

/**
 * @route   POST /api/cards/:cardId/review
 * @desc    Submit a review for a card
 * @access  Private
 */
router.post('/cards/:cardId/review', requireAuth, submitReview);

/**
 * @route   POST /api/decks/:deckId/review/session/start
 * @desc    Start a review session
 * @access  Private
 */
router.post('/decks/:deckId/review/session/start', requireAuth, startSession);

/**
 * @route   POST /api/review/session/:sessionId/end
 * @desc    End a review session
 * @access  Private
 */
router.post('/review/session/:sessionId/end', requireAuth, endSession);

/**
 * @route   GET /api/decks/:deckId/stats
 * @desc    Get deck statistics
 * @access  Private
 */
router.get('/decks/:deckId/stats', requireAuth, getDeckStats);

export default router;