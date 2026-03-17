import { Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';
import { createDeckSchema, updateDeckSchema } from '../validations/deck.validation';

/**
 * Get all decks for the authenticated user
 */
export async function getDecks(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const decks = await prisma.deck.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      include: {
        _count: {
          select: { cards: true },
        },
      },
    });

    return res.json({ decks });
  } catch (error) {
    return next(error);
  }
}

/**
 * Get a single deck by ID
 */
export async function getDeck(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.userId;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const deck = await prisma.deck.findFirst({
      where: {
        id,
        userId,
      },
      include: {
        _count: {
          select: { cards: true },
        },
      },
    });

    if (!deck) {
      return res.status(404).json({ error: 'Deck not found' });
    }

    return res.json({ deck });
  } catch (error) {
    return next(error);
  }
}

/**
 * Create a new deck
 */
export async function createDeck(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    // Validate input
    const parsed = createDeckSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: 'Validation error',
        details: parsed.error.flatten().fieldErrors,
      });
    }

    const { name } = parsed.data;

    const deck = await prisma.deck.create({
      data: {
        name,
        userId,
      },
      include: {
        _count: {
          select: { cards: true },
        },
      },
    });

    return res.status(201).json({ deck });
  } catch (error) {
    return next(error);
  }
}

/**
 * Update a deck (rename)
 */
export async function updateDeck(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.userId;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    // Validate input
    const parsed = updateDeckSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: 'Validation error',
        details: parsed.error.flatten().fieldErrors,
      });
    }

    const { name } = parsed.data;

    // Check if deck exists and belongs to user
    const existingDeck = await prisma.deck.findFirst({
      where: { id, userId },
    });

    if (!existingDeck) {
      return res.status(404).json({ error: 'Deck not found' });
    }

    const deck = await prisma.deck.update({
      where: { id },
      data: { name },
      include: {
        _count: {
          select: { cards: true },
        },
      },
    });

    return res.json({ deck });
  } catch (error) {
    return next(error);
  }
}

/**
 * Delete a deck
 */
export async function deleteDeck(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.userId;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    // Check if deck exists and belongs to user
    const existingDeck = await prisma.deck.findFirst({
      where: { id, userId },
    });

    if (!existingDeck) {
      return res.status(404).json({ error: 'Deck not found' });
    }

    await prisma.deck.delete({
      where: { id },
    });

    return res.json({ success: true });
  } catch (error) {
    return next(error);
  }
}
