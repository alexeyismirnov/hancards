import { Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';
import { lookupSchema } from '../validations/dictionary.validation';

/**
 * Lookup dictionary entries by character
 * @route GET /api/dictionary/lookup
 * @access Public
 */
export async function lookup(req: Request, res: Response, next: NextFunction) {
  try {
    // Validate query parameters
    const parsed = lookupSchema.safeParse(req.query);
    if (!parsed.success) {
      return res.status(400).json({
        error: 'Validation error',
        details: parsed.error.flatten().fieldErrors,
      });
    }

    const { character, variant } = parsed.data;

    // Search based on variant (simplified or traditional)
    const entries = await prisma.dictionaryEntry.findMany({
      where: {
        ...(variant === 'simplified'
          ? { simplified: { startsWith: character } }
          : { traditional: { startsWith: character } }),
      },
      take: 20, // Limit results for auto-suggest
      orderBy: {
        frequencyRank: 'asc', // Most frequent first
      },
    });

    res.json({
      entries,
      count: entries.length,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get a single dictionary entry by ID
 * @route GET /api/dictionary/entry/:id
 * @access Public
 */
export async function getEntry(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;

    const entry = await prisma.dictionaryEntry.findUnique({
      where: { id },
    });

    if (!entry) {
      return res.status(404).json({
        error: 'Entry not found',
      });
    }

    res.json({ entry });
  } catch (error) {
    next(error);
  }
}
