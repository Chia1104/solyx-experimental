import * as z from 'zod';

export const ClaimReward = z.object({
  success: z.boolean(),
  message: z.string().nullish(),
});

export type ClaimReward = z.infer<typeof ClaimReward>;

export const ClaimRewardRequest = z.object({
  campaignId: z.string(),
  address: z.string(),
  ampId: z.string(),
});

export type ClaimRewardRequest = z.infer<typeof ClaimRewardRequest>;
