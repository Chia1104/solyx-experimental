import * as z from 'zod';

import { BannerType } from '../enums/banners.enum';

export const BannerItem = z.object({
  id: z.string(),
  type: z.enum(BannerType),
  imageUrl: z.string(),
  link: z.string().optional(),
});

export type BannerItem = z.infer<typeof BannerItem>;

export const Banners = z.array(BannerItem);

export type Banners = z.infer<typeof Banners>;
