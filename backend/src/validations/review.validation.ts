import { z } from 'zod';

/**
 * Validation schema for GET /api/decks/:deckId/review/due
 */
export const getDueCardsSchema = z.object({
  query: z.object({
    newCardsLimit: z.coerce.number().int().min(0).max(100).default(20).optional(),
  }),
});

/**
 * Validation schema for POST /api/cards/:cardId/review
 */
export const submitReviewSchema = z.object({
  params: z.object({
    cardId: z.string().min(1, 'Card ID is required'),
  }),
  body: z.object({
    rating: z.enum(['again', 'hard', 'good', 'easy'], {
      errorMap: () => ({ message: 'Rating must be one of: again, hard, good, easy' }),
    }),
    sessionId: z.string().optional(),
  }),
});

/**
 * Validation schema for POST /api/decks/:deckId/review/session/start
 */
export const startSessionSchema = z.object({
  params: z.object({
    deckId: z.string().min(1, 'Deck ID is required'),
  }),
});

/**
 * Validation schema for POST /api/review/session/:sessionId/end
 */
export const endSessionSchema = z.object({
  params: z.object({
    sessionId: z.string().min(1, 'Session ID is required'),
  }),
  body: z.object({
    totalCards: z.number().int().min(0).default(0),
    correctCount: z.number().int().min(0).default(0),
  }),
});

/**
 * Validation schema for GET /api/decks/:deckId/stats
 */
export const getDeckStatsSchema = z.object({
  params: z.object({
    deckId: z.string().min(1, 'Deck ID is required'),
  }),
});

export type GetDueCardsInput = z.infer<typeof getDueCardsSchema>;
export type SubmitReviewInput = z.infer<typeof submitReviewSchema>;
export type StartSessionInput = z.infer<typeof startSessionSchema>;
export type EndSessionInput = z.infer<typeof endSessionSchema>;
export type GetDeckStatsInput = z.infer<typeof getDeckStatsSchema>;