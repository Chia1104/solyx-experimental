import { useCallback, useMemo } from 'react';

import BigNumber from 'bignumber.js';

import { useChainAdapterStore } from '@/modules/chain/stores/chain-adapter';
import {
  EIP155_CHAINS,
  LIQUID_CHAINS,
  TRON_CHAINS,
} from '@/modules/chain/stores/chain-adapter/chains';
import { ChainType } from '@/modules/chain/stores/chain-adapter/types';
import { useUserStore } from '@/modules/user/stores/user';
import type { Assets, WalletItem } from '@/modules/user/stores/user/types';

import { useQueryPrices } from './use-query-prices';

const EMPTY_TOKEN_BALANCES: Record<string, string> = {};

const chainConfigs = {
  ...EIP155_CHAINS,
  ...TRON_CHAINS,
  ...LIQUID_CHAINS,
};

const getChainConfig = (chainId: number) =>
  Object.values(chainConfigs).find(chain => chain.chainId === chainId);

const getWalletAddress = (wallet: WalletItem | undefined, chainType: ChainType) => {
  if (!wallet) {
    return '';
  }

  if (chainType === ChainType.EVM) {
    return wallet.evmAddress ?? '';
  }

  if (chainType === ChainType.TRON) {
    return wallet.tronAddress ?? '';
  }

  if (chainType === ChainType.LIQUID) {
    return wallet.liquidAmpId ?? '';
  }

  return '';
};

const toTokenAmount = (rawBalance: string | undefined, decimals: number, decimalPlaces: number) => {
  if (!rawBalance) {
    return '0';
  }

  return new BigNumber(rawBalance)
    .dividedBy(new BigNumber(10).pow(decimals))
    .toFixed(decimalPlaces);
};

export const useHomeAssets = () => {
  const currentChainId = useUserStore(state => state.wallet.currentChainId);
  const currentWalletIndex = useUserStore(state => state.wallet.currentWalletIndex);
  const wallets = useUserStore(state => state.wallet.wallets);
  const assets = useUserStore(state => state.defiAssets.assets);
  const balanceRefreshTrigger = useUserStore(state => state.defiAssets.balanceRefreshTrigger);
  const setUserAssets = useUserStore(state => state.setUserAssets);
  const triggerBalanceRefresh = useUserStore(state => state.triggerBalanceRefresh);
  const getAdapterByChainId = useChainAdapterStore(state => state.getAdapterByChainId);
  const pricesQuery = useQueryPrices();

  const currentWallet = wallets[currentWalletIndex];
  const currentChain = useMemo(() => getChainConfig(currentChainId), [currentChainId]);
  const currentAddress = getWalletAddress(currentWallet, currentChain?.chainType ?? ChainType.EVM);

  const priceBySymbol = useMemo(() => {
    return new Map(
      (pricesQuery.data?.prices ?? []).map(item => [
        item.symbol.toUpperCase(),
        new BigNumber(item.price),
      ]),
    );
  }, [pricesQuery.data?.prices]);

  const tokenBalances = useMemo(() => {
    if (!currentChain || !currentAddress) {
      return EMPTY_TOKEN_BALANCES;
    }

    return assets[String(currentChain.chainId)]?.[currentAddress] ?? EMPTY_TOKEN_BALANCES;
  }, [assets, currentAddress, currentChain]);

  const rows = useMemo(() => {
    if (!currentChain) {
      return [];
    }

    const currencies = Array.from(
      new Map(
        [currentChain.nativeCurrency, ...(currentChain.supportCurrency ?? [])].map(currency => [
          currency.address,
          currency,
        ]),
      ).values(),
    );

    return currencies.map(currency => {
      const balance = toTokenAmount(
        tokenBalances[currency.address],
        currency.decimals,
        'decimalPlaces' in currency ? currency.decimalPlaces : 6,
      );
      const price = priceBySymbol.get(currency.symbol.toUpperCase()) ?? new BigNumber(0);
      const fiatValue = new BigNumber(balance).multipliedBy(price);

      return {
        address: currency.address,
        balance,
        fiatValue,
        name: currency.name,
        symbol: currency.symbol,
      };
    });
  }, [currentChain, priceBySymbol, tokenBalances]);

  const totalFiatValue = useMemo(
    () => rows.reduce((total, row) => total.plus(row.fiatValue), new BigNumber(0)),
    [rows],
  );

  const refreshBalances = useCallback(async () => {
    if (!currentChain || !currentAddress) {
      return;
    }

    const adapter = getAdapterByChainId(currentChain.chainId);
    const balance = await adapter.getBalance(
      currentAddress,
      currentChain.chainId,
      currentWallet?.liquidSubaccountPointer,
    );
    const nextTokenBalances =
      typeof balance === 'string'
        ? { [currentChain.nativeCurrency.address]: balance }
        : Object.fromEntries(
            Object.entries(balance).map(([tokenAddress, value]) => [tokenAddress, String(value)]),
          );

    const nextAssets: Assets = {
      ...assets,
      [currentChain.chainId]: {
        ...assets[String(currentChain.chainId)],
        [currentAddress]: nextTokenBalances,
      },
    };

    setUserAssets(nextAssets);
    triggerBalanceRefresh();
  }, [
    assets,
    currentAddress,
    currentChain,
    currentWallet?.liquidSubaccountPointer,
    getAdapterByChainId,
    setUserAssets,
    triggerBalanceRefresh,
  ]);

  return {
    balanceRefreshTrigger,
    chain: currentChain,
    currentAddress,
    isPricesLoading: pricesQuery.isLoading,
    pricesError: pricesQuery.error,
    refreshBalances,
    rows,
    totalFiatValue,
    wallet: currentWallet,
  };
};
