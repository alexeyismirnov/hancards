import { z } from 'zod';

export const createDeckSchema = z.object({
  name: z.string().min(1, 'Deck name is required').max(100, 'Deck name must be 100 characters or less'),
});

export const updateDeckSchema = z.object({
  name: z.string().min(1, 'Deck name is required').max(100, 'Deck name must be 100 characters or less'),
});

export type CreateDeckInput = z.infer<typeof createDeckSchema>;
export type UpdateDeckInput = z.infer<typeof updateDeckSchema>;
