import * as z from 'zod';

export const MetaItem = z.object({
  decimalRecord: z.number(),
  decimalAsset: z.number(),
  decimalWithdrawal: z.number(),
});

export type MetaItem = z.infer<typeof MetaItem>;

export const Meta = z.record(z.string(), MetaItem);

export type Meta = z.infer<typeof Meta>;
