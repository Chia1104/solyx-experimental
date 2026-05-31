import { TokenType } from '@/modules/chain/stores/chain-adapter/types';
import type { ChainConfig, ChainCurrency } from '@/modules/chain/stores/chain-adapter/types';

export interface AssetActionFlags {
  showBuy: boolean;
  showShield: boolean;
  showSwap: boolean;
  showUnshield: boolean;
  showWithdraw: boolean;
  withdrawDisabled: boolean;
}

export const getIsNativeToken = ({
  currency,
  chain,
  isLIQUID,
}: {
  currency?: Pick<ChainCurrency, 'symbol' | 'tokenType'> | null;
  chain?: ChainConfig;
  isLIQUID: boolean;
}) => {
  if (currency?.tokenType === TokenType.Native) {
    return true;
  }

  if (
    isLIQUID &&
    chain?.nativeCurrency?.symbol &&
    currency?.symbol === chain.nativeCurrency.symbol
  ) {
    return true;
  }

  return false;
};

export const getAssetActionFlags = ({
  coinbaseOnrampEnabled,
  currencySymbol,
  defiWithdrawalEnabled,
  isEVM,
  isLIQUID,
  isNativeToken,
  isTRON,
}: {
  coinbaseOnrampEnabled: boolean;
  currencySymbol?: string;
  defiWithdrawalEnabled: boolean;
  isEVM: boolean;
  isLIQUID: boolean;
  isNativeToken: boolean;
  isTRON: boolean;
}): AssetActionFlags => {
  const sym = (currencySymbol ?? '').toUpperCase();
  const next: AssetActionFlags = {
    showBuy: !isLIQUID && coinbaseOnrampEnabled,
    showShield: false,
    showSwap: true,
    showUnshield: false,
    showWithdraw: !isNativeToken && defiWithdrawalEnabled,
    withdrawDisabled: false,
  };

  if (!currencySymbol) {
    return next;
  }

  if (isEVM) {
    if (isNativeToken) {
      return { ...next, showSwap: false };
    }

    if (sym === 'USDT') {
      return { ...next, showShield: false };
    }

    if (sym === 'USDC') {
      return {
        ...next,
        showShield: false,
        showSwap: false,
        showWithdraw: false,
      };
    }

    return next;
  }

  if (isTRON) {
    if (isNativeToken) {
      return { ...next, showBuy: false, showSwap: false };
    }

    if (sym === 'USDT') {
      return {
        ...next,
        showBuy: false,
        showShield: false,
      };
    }

    if (sym === 'USDC') {
      return {
        ...next,
        showBuy: false,
        showShield: false,
        showSwap: false,
        showWithdraw: false,
      };
    }

    return next;
  }

  if (isLIQUID) {
    if (isNativeToken) {
      return { ...next, showSwap: false, showWithdraw: false };
    }

    if (sym === 'USDT') {
      return { ...next, showUnshield: false };
    }

    return next;
  }

  return next;
};
