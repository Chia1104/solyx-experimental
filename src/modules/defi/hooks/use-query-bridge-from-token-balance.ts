import { useMemo } from 'react';

import { useQuery } from '@tanstack/react-query';
import BigNumber from 'bignumber.js';

import type { SupportedChainID } from '@/modules/chain/enums/supported-chain.enum';
import { useChainAdapterStore } from '@/modules/chain/stores/chain-adapter';
import type { ChainConfig, ChainCurrency } from '@/modules/chain/stores/chain-adapter/types';
import { ChainType } from '@/modules/chain/stores/chain-adapter/types';
import { fromBridgeApiChainId } from '@/modules/chain/utils';

import { getChainConfig, useDefiAccount } from './use-defi-account';

type ChainCurrencyOption = ChainConfig['nativeCurrency'] | ChainCurrency;

interface UseQueryBridgeFromTokenBalanceParams {
  fromChainId: SupportedChainID;
  fromToken: string;
}

const getSelectedChainAddress = (
  chainType: ChainType | undefined,
  addresses: ReturnType<typeof useDefiAccount>['addresses'],
) => {
  switch (chainType) {
    case ChainType.EVM:
      return addresses.evm;
    case ChainType.TRON:
      return addresses.tron;
    case ChainType.LIQUID:
      return addresses.liquid;
    default:
      return '';
  }
};

const getCurrencyDecimalPlaces = (currency: ChainCurrencyOption) =>
  'decimalPlaces' in currency ? currency.decimalPlaces : 6;

const normalizeCurrencySymbol = (symbol: string) => (symbol === 'LBTC' ? 'L-BTC' : symbol);

const toTokenAmount = (rawBalance: string | undefined, decimals: number, decimalPlaces: number) => {
  if (!rawBalance) {
    return '0';
  }

  return new BigNumber(rawBalance)
    .dividedBy(new BigNumber(10).pow(decimals))
    .toFixed(decimalPlaces);
};

export const useQueryBridgeFromTokenBalance = ({
  fromChainId,
  fromToken,
}: UseQueryBridgeFromTokenBalanceParams) => {
  const { addresses, liquidSubaccountPointer } = useDefiAccount();
  const getAdapterByChainId = useChainAdapterStore(state => state.getAdapterByChainId);

  const chain = useMemo(() => {
    const appChainId = fromBridgeApiChainId(fromChainId);
    return getChainConfig(Number(appChainId));
  }, [fromChainId]);

  const currency = useMemo(() => {
    const currencies = [
      ...(chain ? [chain.nativeCurrency] : []),
      ...(chain?.supportCurrency ?? []),
    ];
    const normalizedFromToken = normalizeCurrencySymbol(fromToken);
    return currencies.find(item => item.symbol === normalizedFromToken);
  }, [chain, fromToken]);

  const chainId = chain?.chainId ?? 0;
  const address = getSelectedChainAddress(chain?.chainType, addresses);
  const isLiquidChain = chain?.chainType === ChainType.LIQUID;

  const query = useQuery({
    enabled: Boolean(chain && address && currency),
    queryKey: [
      'defi/bridge/from-assets',
      chainId,
      address,
      isLiquidChain ? (liquidSubaccountPointer ?? null) : null,
    ],
    queryFn: () =>
      getAdapterByChainId(chainId).getBalances(
        address,
        chainId,
        isLiquidChain ? liquidSubaccountPointer : undefined,
      ),
    gcTime: 0,
    staleTime: 0,
  });

  const decimalPlaces = currency ? getCurrencyDecimalPlaces(currency) : 6;
  const balance = currency
    ? toTokenAmount(query.data?.[currency.address], currency.decimals, decimalPlaces)
    : '0';

  return {
    balance,
    chain,
    currency,
    decimalPlaces,
    query,
  };
};
