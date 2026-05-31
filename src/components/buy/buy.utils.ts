import type { ChainCurrency } from '@/modules/chain/stores/chain-adapter/types';
import { TokenType } from '@/modules/chain/stores/chain-adapter/types';

export const pickDefaultBuyCurrency = (
  currencies: readonly ChainCurrency[],
  paramSymbol: string | undefined,
): ChainCurrency | undefined => {
  if (currencies.length === 0) {
    return undefined;
  }

  if (paramSymbol) {
    const found = currencies.find(
      currency => currency.symbol.toUpperCase() === paramSymbol.toUpperCase(),
    );
    if (found) {
      return found;
    }
  }

  return currencies[0];
};

export const sortSupportCurrencies = (currencies: readonly ChainCurrency[]) =>
  [...currencies].sort((a, b) => {
    const aIsNative = a.tokenType === TokenType.Native ? 1 : 0;
    const bIsNative = b.tokenType === TokenType.Native ? 1 : 0;
    return aIsNative - bIsNative;
  });

export const getOnrampApiErrorMessage = (error: unknown): string | null => {
  if (!error || typeof error !== 'object' || !('data' in error)) {
    return null;
  }

  const data = (error as { data?: { errors?: { message?: string }[] } }).data;

  return data?.errors?.[0]?.message ?? null;
};
