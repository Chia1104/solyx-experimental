import * as z from 'zod';

export const DefiMetaItem = z.object({
  decimalRecord: z.string(),
  decimalAsset: z.string(),
  decimalWithdrawal: z.string(),
});

export type DefiMetaItem = z.infer<typeof DefiMetaItem>;

export const DefiMeta = z.record(z.string(), DefiMetaItem);

export type DefiMeta = z.infer<typeof DefiMeta>;

export const PriceItem = z.object({
  symbol: z.string(),
  price: z.string(),
});

export type PriceItem = z.infer<typeof PriceItem>;

export const Prices = z.object({
  prices: z.array(PriceItem),
});

export type Prices = z.infer<typeof Prices>;
