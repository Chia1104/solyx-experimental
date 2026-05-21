import { useMemo } from 'react';

import type { UseQueryOptions } from '@tanstack/react-query';
import { queryOptions, useQuery } from '@tanstack/react-query';
import BigNumber from 'bignumber.js';

import { useChainAdapterStore } from '@/modules/chain/stores/chain-adapter';
import {
  EIP155_CHAINS,
  LIQUID_CHAINS,
  TRON_CHAINS,
} from '@/modules/chain/stores/chain-adapter/chains';
import type { ChainConfig, ChainCurrency } from '@/modules/chain/stores/chain-adapter/types';
import { ChainType } from '@/modules/chain/stores/chain-adapter/types';
import { useUserStore } from '@/modules/user/stores/user';
import type { WalletItem } from '@/modules/user/stores/user/types';

import { useQueryPrices } from './use-query-prices';

type TokenBalances = Record<string, string>;

interface QueryAssetsRequest {
  address: string;
  chain?: ChainConfig;
  chainId: number;
  liquidSubaccountPointer?: number;
  getBalances: (address: string, chainId: number, index?: number) => Promise<TokenBalances>;
}

type UseQueryAssetsBalanceOptions = Omit<
  UseQueryOptions<TokenBalances, Error>,
  'queryKey' | 'queryFn'
>;

const EMPTY_BALANCES: TokenBalances = {};

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

const getCurrencies = (chain: ChainConfig) =>
  Array.from(
    new Map(
      [chain.nativeCurrency, ...(chain.supportCurrency ?? [])].map(currency => [
        currency.address,
        currency,
      ]),
    ).values(),
  );

const getPriceSymbol = (symbol: string) => {
  if (symbol === 'USDT' || symbol === 'USDC') {
    return symbol;
  }

  if (symbol === 'L-BTC' || symbol === 'LBTC') {
    return 'BTC-USDT';
  }

  return `${symbol}-USDT`;
};

const getCurrencyDecimalPlaces = (currency: ChainConfig['nativeCurrency'] | ChainCurrency) => {
  return 'decimalPlaces' in currency ? currency.decimalPlaces : 6;
};

const toTokenAmount = (rawBalance: string | undefined, decimals: number, decimalPlaces: number) => {
  if (!rawBalance) {
    return '0';
  }

  return new BigNumber(rawBalance)
    .dividedBy(new BigNumber(10).pow(decimals))
    .toFixed(decimalPlaces);
};

const fetchAssetBalances = async (request: QueryAssetsRequest) => {
  if (!request.chain) {
    return EMPTY_BALANCES;
  }

  return request.getBalances(request.address, request.chainId, request.liquidSubaccountPointer);
};

export const queryAssetsOptions = (
  request: QueryAssetsRequest,
  options?: UseQueryAssetsBalanceOptions,
) => {
  return queryOptions({
    queryKey: [
      'defi/assets',
      request.chainId,
      request.address,
      request.liquidSubaccountPointer ?? null,
    ],
    queryFn: () => fetchAssetBalances(request),
    ...options,
  });
};

export const useQueryAssets = (options?: UseQueryAssetsBalanceOptions) => {
  const currentChainId = useUserStore(state => state.wallet.currentChainId);
  const currentWalletIndex = useUserStore(state => state.wallet.currentWalletIndex);
  const wallets = useUserStore(state => state.wallet.wallets);
  const getAdapterByChainId = useChainAdapterStore(state => state.getAdapterByChainId);
  const pricesQuery = useQueryPrices();

  const wallet = wallets[currentWalletIndex];
  const chain = useMemo(() => getChainConfig(currentChainId), [currentChainId]);
  const currentAddress = getWalletAddress(wallet, chain?.chainType ?? ChainType.EVM);
  const balanceQuery = useQuery(
    queryAssetsOptions(
      {
        address: currentAddress,
        chain,
        chainId: currentChainId,
        getBalances: (address, chainId, index) =>
          getAdapterByChainId(chainId).getBalances(address, chainId, index),
        liquidSubaccountPointer: wallet?.liquidSubaccountPointer,
      },
      {
        enabled: Boolean(chain && currentAddress),
        ...options,
      },
    ),
  );

  const priceBySymbol = useMemo(() => {
    return new Map(
      (pricesQuery.data?.prices ?? []).map(item => [
        item.symbol.toUpperCase(),
        new BigNumber(item.price),
      ]),
    );
  }, [pricesQuery.data?.prices]);

  const assets = useMemo(() => (chain ? getCurrencies(chain) : []), [chain]);

  const rows = useMemo(() => {
    return assets.map(currency => {
      const balance = toTokenAmount(
        balanceQuery.data?.[currency.address],
        currency.decimals,
        getCurrencyDecimalPlaces(currency),
      );
      const price =
        priceBySymbol.get(getPriceSymbol(currency.symbol)) ??
        (currency.symbol === 'USDT' || currency.symbol === 'USDC'
          ? new BigNumber(1)
          : new BigNumber(0));
      const fiatValue = new BigNumber(balance).multipliedBy(price);

      return {
        address: currency.address,
        balance,
        fiatValue,
        name: currency.name,
        price: price.toString(),
        symbol: currency.symbol,
      };
    });
  }, [assets, balanceQuery.data, priceBySymbol]);

  const totalFiatValue = useMemo(
    () => rows.reduce((total, row) => total.plus(row.fiatValue), new BigNumber(0)),
    [rows],
  );

  return {
    assets,
    balanceQuery,
    chain,
    currentAddress,
    isAssetsLoading: balanceQuery.isLoading || pricesQuery.isLoading,
    pricesQuery,
    rows,
    totalFiatValue,
    wallet,
  };
};
