export const GAEvent = {
  WalletMigrate: 'wallet_migrate',
  Login: 'login',
  LoginSuccess: 'login_success',
  SwapClick: 'swap_click',
  Swap: 'swap',
  KYC: 'kyc',
  WalletConnect: 'wallet_connect',
  DefiBrowser: 'defi_browser',
  Bookmark: 'bookmark',
  ScreenView: 'screen_view',
} as const;

export type GAEvent = (typeof GAEvent)[keyof typeof GAEvent];
