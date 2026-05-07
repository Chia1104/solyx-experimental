export const BannerType = {
  Banner: 'banner',
  Popup: 'popup',
} as const;

export type BannerType = (typeof BannerType)[keyof typeof BannerType];
