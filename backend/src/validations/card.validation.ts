import { z } from 'zod';

export const createCardSchema = z.object({
  character: z.string().min(1, 'Character is required').max(50, 'Character must be 50 characters or less'),
  pinyin: z.string().min(1, 'Pinyin is required').max(100, 'Pinyin must be 100 characters or less'),
  meaning: z.string().min(1, 'Meaning is required').max(500, 'Meaning must be 500 characters or less'),
});

export const updateCardSchema = z.object({
  character: z.string().min(1, 'Character is required').max(50, 'Character must be 50 characters or less'),
  pinyin: z.string().min(1, 'Pinyin is required').max(100, 'Pinyin must be 100 characters or less'),
  meaning: z.string().min(1, 'Meaning is required').max(500, 'Meaning must be 500 characters or less'),
});

export type CreateCardInput = z.infer<typeof createCardSchema>;
export type UpdateCardInput = z.infer<typeof updateCardSchema>;
