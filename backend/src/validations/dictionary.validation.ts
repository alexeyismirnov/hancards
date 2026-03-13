import { z } from 'zod';

export const lookupSchema = z.object({
  character: z.string().min(1, 'Character is required'),
  variant: z.enum(['simplified', 'traditional']).optional().default('simplified'),
});

export type LookupInput = z.infer<typeof lookupSchema>;
