export const SupportedCurrencySymbol = {
  ETH: 'ETH',
  USDC: 'USDC',
  USDT: 'USDT',
  TRX: 'TRX',
  'L-BTC': 'L-BTC',
  LBTC: 'LBTC',
  BTC: 'BTC',
} as const;

export type SupportedCurrencySymbol =
  (typeof SupportedCurrencySymbol)[keyof typeof SupportedCurrencySymbol];
