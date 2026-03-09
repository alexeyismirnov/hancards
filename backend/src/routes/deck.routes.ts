import { Router } from 'express';
import {
  getDecks,
  getDeck,
  createDeck,
  updateDeck,
  deleteDeck,
} from '../controllers/deck.controller';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();

/**
 * @route   GET /api/decks
 * @desc    Get all decks for authenticated user
 * @access  Private
 */
router.get('/', requireAuth, getDecks);

/**
 * @route   GET /api/decks/:id
 * @desc    Get a single deck by ID
 * @access  Private
 */
router.get('/:id', requireAuth, getDeck);

/**
 * @route   POST /api/decks
 * @desc    Create a new deck
 * @access  Private
 */
router.post('/', requireAuth, createDeck);

/**
 * @route   PUT /api/decks/:id
 * @desc    Update (rename) a deck
 * @access  Private
 */
router.put('/:id', requireAuth, updateDeck);

/**
 * @route   DELETE /api/decks/:id
 * @desc    Delete a deck
 * @access  Private
 */
router.delete('/:id', requireAuth, deleteDeck);

export default router;
