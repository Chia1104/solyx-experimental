import * as z from 'zod';

import { AppFeatureStatus, AppSiteStatus } from '../enums/meta.enum';

export const UpdateVersions = z.object({
  ios: z.string(),
  android: z.string(),
});

export type UpdateVersions = z.infer<typeof UpdateVersions>;

export const ClientVersions = z.object({
  update: UpdateVersions,
  forceUpdate: UpdateVersions.optional(),
});

export type ClientVersions = z.infer<typeof ClientVersions>;

export const CampaignFeatures = z.object({
  LIQUID_USDT_GETS_SATS: z.enum(AppFeatureStatus).optional(),
});

export type CampaignFeatures = z.infer<typeof CampaignFeatures>;

export const AppFeatures = z.looseObject({
  campaigns: CampaignFeatures.optional(),
  coinbaseOnramp: z.enum(AppFeatureStatus).optional(),
  defiWithdrawal: z.enum(AppFeatureStatus).optional(),
});

export type AppFeatures = z.infer<typeof AppFeatures>;

export const Meta = z.object({
  siteStatus: z.enum(AppSiteStatus),
  features: AppFeatures.optional(),
  clientVersions: ClientVersions.optional(),
});

export type Meta = z.infer<typeof Meta>;
