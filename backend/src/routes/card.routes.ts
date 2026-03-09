import { Router } from 'express';
import {
  getCards,
  createCard,
  updateCard,
  deleteCard,
} from '../controllers/card.controller';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();

/**
 * @route   GET /api/decks/:deckId/cards
 * @desc    Get all cards in a deck
 * @access  Private
 */
router.get('/decks/:deckId/cards', requireAuth, getCards);

/**
 * @route   POST /api/decks/:deckId/cards
 * @desc    Create a new card in a deck
 * @access  Private
 */
router.post('/decks/:deckId/cards', requireAuth, createCard);

/**
 * @route   PUT /api/cards/:id
 * @desc    Update a card
 * @access  Private
 */
router.put('/cards/:id', requireAuth, updateCard);

/**
 * @route   DELETE /api/cards/:id
 * @desc    Delete a card
 * @access  Private
 */
router.delete('/cards/:id', requireAuth, deleteCard);

export default router;
