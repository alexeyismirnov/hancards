import { Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';
import { calculateNextReview, Rating } from '../services/sm2.service';

/**
 * Get due cards for review
 * Route: GET /api/decks/:deckId/review/due
 */
export async function getDueCards(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.userId;
    const { deckId } = req.params;
    const newCardsLimit = parseInt(req.query.newCardsLimit as string) || 20;

    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    // Verify user owns the deck
    const deck = await prisma.deck.findFirst({
      where: {
        id: deckId,
        userId,
      },
    });

    if (!deck) {
      return res.status(404).json({ error: 'Deck not found' });
    }

    const now = new Date();

    // Get cards with CardProgress where nextReviewDate <= now
    const dueProgressRecords = await prisma.cardProgress.findMany({
      where: {
        userId,
        nextReviewDate: { lte: now },
        card: {
          deckId,
        },
      },
      include: {
        card: true,
      },
    });

    // Format due cards with progress data
    const dueCards = dueProgressRecords.map((record) => ({
      ...record.card,
      progress: {
        id: record.id,
        easeFactor: record.easeFactor,
        interval: record.interval,
        repetitions: record.repetitions,
        nextReviewDate: record.nextReviewDate,
        lastReviewDate: record.lastReviewDate,
        lapses: record.lapses,
      },
    }));

    // Get new cards (cards without CardProgress for this user)
    // First get all card IDs that have progress for this user
    const cardsWithProgress = await prisma.cardProgress.findMany({
      where: {
        userId,
        card: {
          deckId,
        },
      },
      select: {
        cardId: true,
      },
    });

    const cardIdsWithProgress = cardsWithProgress.map((p) => p.cardId);

    // Then get cards that don't have progress
    const newCards = await prisma.card.findMany({
      where: {
        deckId,
        id: {
          notIn: cardIdsWithProgress,
        },
      },
      take: newCardsLimit,
    });

    // Format new cards with null progress
    const formattedNewCards = newCards.map((card) => ({
      ...card,
      progress: null,
    }));

    return res.json({
      dueCards,
      newCards: formattedNewCards,
      totalDue: dueCards.length,
      totalNew: formattedNewCards.length,
    });
  } catch (error) {
    return next(error);
  }
}

/**
 * Submit a review for a card
 * Route: POST /api/cards/:cardId/review
 */
export async function submitReview(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.userId;
    const { cardId } = req.params;
    const { rating, sessionId } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    // Verify user owns the card (through deck ownership)
    const card = await prisma.card.findFirst({
      where: { id: cardId },
      include: { deck: true },
    });

    if (!card) {
      return res.status(404).json({ error: 'Card not found' });
    }

    if (card.deck.userId !== userId) {
      return res.status(403).json({ error: 'Not authorized to review this card' });
    }

    // Get or create CardProgress for user/card
    let progress = await prisma.cardProgress.findUnique({
      where: {
        cardId_userId: {
          cardId,
          userId,
        },
      },
    });

    // Calculate next review using SM-2 algorithm
    const currentProgressData = progress
      ? {
          easeFactor: progress.easeFactor,
          interval: progress.interval,
          repetitions: progress.repetitions,
          nextReviewDate: progress.nextReviewDate,
          lastReviewDate: progress.lastReviewDate,
          lapses: progress.lapses,
        }
      : null;

    const sm2Result = calculateNextReview(rating as Rating, currentProgressData);

    // Update or create CardProgress
    const updatedProgress = await prisma.cardProgress.upsert({
      where: {
        cardId_userId: {
          cardId,
          userId,
        },
      },
      update: {
        easeFactor: sm2Result.easeFactor,
        interval: sm2Result.interval,
        repetitions: sm2Result.repetitions,
        nextReviewDate: sm2Result.nextReviewDate,
        lastReviewDate: sm2Result.lastReviewDate,
        lapses: sm2Result.lapses,
      },
      create: {
        cardId,
        userId,
        easeFactor: sm2Result.easeFactor,
        interval: sm2Result.interval,
        repetitions: sm2Result.repetitions,
        nextReviewDate: sm2Result.nextReviewDate,
        lastReviewDate: sm2Result.lastReviewDate,
        lapses: sm2Result.lapses,
      },
    });

    // If sessionId provided, create ReviewRecord
    if (sessionId) {
      // Verify session belongs to user
      const session = await prisma.reviewSession.findFirst({
        where: {
          id: sessionId,
          userId,
        },
      });

      if (session) {
        await prisma.reviewRecord.create({
          data: {
            sessionId,
            cardId,
            rating,
          },
        });
      }
    }

    return res.json({
      progress: updatedProgress,
      nextReviewDate: sm2Result.nextReviewDate,
      interval: sm2Result.interval,
    });
  } catch (error) {
    return next(error);
  }
}

/**
 * Start a review session
 * Route: POST /api/decks/:deckId/review/session/start
 */
export async function startSession(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.userId;
    const { deckId } = req.params;

    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    // Verify user owns the deck
    const deck = await prisma.deck.findFirst({
      where: {
        id: deckId,
        userId,
      },
    });

    if (!deck) {
      return res.status(404).json({ error: 'Deck not found' });
    }

    // Create ReviewSession record
    const session = await prisma.reviewSession.create({
      data: {
        userId,
        deckId,
      },
    });

    return res.status(201).json({
      sessionId: session.id,
      startedAt: session.startedAt,
    });
  } catch (error) {
    return next(error);
  }
}

/**
 * End a review session
 * Route: POST /api/review/session/:sessionId/end
 */
export async function endSession(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.userId;
    const { sessionId } = req.params;
    const { totalCards, correctCount } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    // Verify user owns the session
    const session = await prisma.reviewSession.findFirst({
      where: {
        id: sessionId,
        userId,
      },
      include: {
        deck: true,
      },
    });

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    // Update ReviewSession with endedAt, totalCards, correctCount
    const updatedSession = await prisma.reviewSession.update({
      where: { id: sessionId },
      data: {
        endedAt: new Date(),
        totalCards,
        correctCount,
      },
    });

    return res.json({
      sessionId: updatedSession.id,
      deckId: updatedSession.deckId,
      startedAt: updatedSession.startedAt,
      endedAt: updatedSession.endedAt,
      totalCards: updatedSession.totalCards,
      correctCount: updatedSession.correctCount,
    });
  } catch (error) {
    return next(error);
  }
}

/**
 * Get deck statistics
 * Route: GET /api/decks/:deckId/stats
 */
export async function getDeckStats(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.userId;
    const { deckId } = req.params;

    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    // Verify user owns the deck
    const deck = await prisma.deck.findFirst({
      where: {
        id: deckId,
        userId,
      },
    });

    if (!deck) {
      return res.status(404).json({ error: 'Deck not found' });
    }

    // Get total cards in deck
    const totalCards = await prisma.card.count({
      where: { deckId },
    });

    // Get cards with progress (learned cards)
    const learnedCards = await prisma.cardProgress.count({
      where: {
        userId,
        card: {
          deckId,
        },
      },
    });

    // New cards (without progress)
    const newCards = totalCards - learnedCards;

    // Calculate average ease factor
    const progressRecords = await prisma.cardProgress.findMany({
      where: {
        card: {
          deckId,
        },
        userId,
      },
      select: {
        easeFactor: true,
      },
    });

    const averageEaseFactor =
      progressRecords.length > 0
        ? progressRecords.reduce((sum: number, p: { easeFactor: number }) => sum + p.easeFactor, 0) / progressRecords.length
        : 2.5;

    // Get cards due today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const dueToday = await prisma.cardProgress.count({
      where: {
        card: {
          deckId,
        },
        userId,
        nextReviewDate: {
          gte: today,
          lt: tomorrow,
        },
      },
    });

    // Get cards due this week
    const weekEnd = new Date(today);
    weekEnd.setDate(weekEnd.getDate() + 7);

    const dueThisWeek = await prisma.cardProgress.count({
      where: {
        card: {
          deckId,
        },
        userId,
        nextReviewDate: {
          gte: today,
          lt: weekEnd,
        },
      },
    });

    return res.json({
      totalCards,
      learnedCards,
      newCards,
      averageEaseFactor: Math.round(averageEaseFactor * 100) / 100,
      dueToday,
      dueThisWeek,
    });
  } catch (error) {
    return next(error);
  }
}