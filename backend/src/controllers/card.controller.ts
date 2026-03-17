import { Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';
import { createCardSchema, updateCardSchema } from '../validations/card.validation';

/**
 * Get all cards in a deck
 */
export async function getCards(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.userId;
    const { deckId } = req.params;

    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    // Verify deck belongs to user
    const deck = await prisma.deck.findFirst({
      where: {
        id: deckId,
        userId,
      },
    });

    if (!deck) {
      return res.status(404).json({ error: 'Deck not found' });
    }

    const cards = await prisma.card.findMany({
      where: { deckId },
      orderBy: { createdAt: 'asc' },
    });

    return res.json({ cards });
  } catch (error) {
    return next(error);
  }
}

/**
 * Create a new card in a deck
 */
export async function createCard(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.userId;
    const { deckId } = req.params;

    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    // Validate input
    const parsed = createCardSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: 'Validation error',
        details: parsed.error.flatten().fieldErrors,
      });
    }

    const { character, pinyin, meaning } = parsed.data;

    // Verify deck belongs to user
    const deck = await prisma.deck.findFirst({
      where: {
        id: deckId,
        userId,
      },
    });

    if (!deck) {
      return res.status(404).json({ error: 'Deck not found' });
    }

    const card = await prisma.card.create({
      data: {
        deckId,
        character,
        pinyin,
        meaning,
      },
    });

    return res.status(201).json({ card });
  } catch (error) {
    return next(error);
  }
}

/**
 * Update a card
 */
export async function updateCard(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.userId;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    // Validate input
    const parsed = updateCardSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: 'Validation error',
        details: parsed.error.flatten().fieldErrors,
      });
    }

    const { character, pinyin, meaning } = parsed.data;

    // Check if card exists and belongs to user's deck
    const existingCard = await prisma.card.findFirst({
      where: { id },
      include: { deck: true },
    });

    if (!existingCard) {
      return res.status(404).json({ error: 'Card not found' });
    }

    if (existingCard.deck.userId !== userId) {
      return res.status(403).json({ error: 'Not authorized to edit this card' });
    }

    const card = await prisma.card.update({
      where: { id },
      data: { character, pinyin, meaning },
    });

    return res.json({ card });
  } catch (error) {
    return next(error);
  }
}

/**
 * Delete a card
 */
export async function deleteCard(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.userId;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    // Check if card exists and belongs to user's deck
    const existingCard = await prisma.card.findFirst({
      where: { id },
      include: { deck: true },
    });

    if (!existingCard) {
      return res.status(404).json({ error: 'Card not found' });
    }

    if (existingCard.deck.userId !== userId) {
      return res.status(403).json({ error: 'Not authorized to delete this card' });
    }

    await prisma.card.delete({
      where: { id },
    });

    return res.json({ success: true });
  } catch (error) {
    return next(error);
  }
}
