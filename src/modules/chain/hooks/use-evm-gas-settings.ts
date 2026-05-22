import { useMemo } from 'react';

import type { UseQueryOptions } from '@tanstack/react-query';
import { queryOptions, useQuery } from '@tanstack/react-query';
import type { JsonRpcProvider } from 'ethers';

import { useChainAdapterStore } from '@/modules/chain/stores/chain-adapter';
import type { EvmGasSettings } from '@/modules/chain/utils/evm-gas-settings';
import { buildEvmGasSettings } from '@/modules/chain/utils/evm-gas-settings';

const EVM_GAS_SETTINGS_STALE_TIME_MS = 15_000;

export interface QueryEvmGasSettingsRequest {
  chainId?: number;
  gasLimit: string;
  provider: JsonRpcProvider;
}

const fetchEvmGasSettings = async ({
  gasLimit,
  provider,
}: QueryEvmGasSettingsRequest): Promise<EvmGasSettings | undefined> => {
  try {
    const gasLimitValue = BigInt(gasLimit);
    const feeData = await provider.getFeeData();
    return buildEvmGasSettings(feeData, gasLimitValue);
  } catch {
    return undefined;
  }
};

type UseQueryEvmGasSettingsOptions = Omit<
  UseQueryOptions<EvmGasSettings | undefined, Error>,
  'queryKey' | 'queryFn'
>;

export const queryEvmGasSettingsOptions = (
  request: QueryEvmGasSettingsRequest | null,
  options?: UseQueryEvmGasSettingsOptions,
) => {
  return queryOptions({
    queryKey: ['chain', 'evm-gas-settings', request?.chainId, request?.gasLimit],
    queryFn: () => fetchEvmGasSettings(request!),
    enabled: Boolean(request),
    staleTime: EVM_GAS_SETTINGS_STALE_TIME_MS,
    refetchInterval: EVM_GAS_SETTINGS_STALE_TIME_MS,
    retry: false,
    ...options,
  });
};

export interface UseEvmGasSettingsInput {
  chainId?: number;
  gasLimit?: string;
  provider?: JsonRpcProvider;
}

export const useEvmGasSettings = (
  { chainId, gasLimit, provider }: UseEvmGasSettingsInput,
  options?: UseQueryEvmGasSettingsOptions,
) => {
  const getEvmProvider = useChainAdapterStore(state => state.getEvmProvider);

  const resolvedProvider = useMemo(() => {
    if (provider) {
      return provider;
    }

    if (!chainId) {
      return undefined;
    }

    try {
      return getEvmProvider(chainId);
    } catch {
      return undefined;
    }
  }, [chainId, getEvmProvider, provider]);

  const gasLimitValue = useMemo(() => {
    if (!gasLimit) {
      return undefined;
    }

    try {
      return BigInt(gasLimit);
    } catch {
      return undefined;
    }
  }, [gasLimit]);

  const request = useMemo((): QueryEvmGasSettingsRequest | null => {
    if (!resolvedProvider || !gasLimitValue) {
      return null;
    }

    return {
      chainId,
      gasLimit: gasLimitValue.toString(),
      provider: resolvedProvider,
    };
  }, [chainId, gasLimitValue, resolvedProvider]);

  const query = useQuery(queryEvmGasSettingsOptions(request, options));

  return {
    gasSettings: query.data,
    isReady: Boolean(query.data && gasLimitValue),
  };
};
