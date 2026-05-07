export const AppSiteStatus = {
  Operational: 'operational',
  InMaintenance: 'inMaintenance',
} as const;

export type AppSiteStatus = (typeof AppSiteStatus)[keyof typeof AppSiteStatus];

export const AppFeatureStatus = {
  Enabled: 'enabled',
  Disabled: 'disabled',
} as const;

export type AppFeatureStatus = (typeof AppFeatureStatus)[keyof typeof AppFeatureStatus];
