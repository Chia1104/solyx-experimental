import * as z from 'zod';

export const CommonResponse = z.object({
  data: z.unknown(),
});

export type CommonResponse = z.infer<typeof CommonResponse>;
