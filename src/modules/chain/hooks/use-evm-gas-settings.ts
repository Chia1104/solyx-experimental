import { useEffect, useMemo, useState } from 'react';

import type { JsonRpcProvider } from 'ethers';

import { useChainAdapterStore } from '@/modules/chain/stores/chain-adapter';
import type { EvmGasSettings } from '@/modules/chain/utils/evm-gas-settings';
import { buildEvmGasSettings } from '@/modules/chain/utils/evm-gas-settings';

const FEE_DATA_POLL_INTERVAL_MS = 15_000;

interface UseEvmGasSettingsInput {
  chainId?: number;
  gasLimit?: string;
  provider?: JsonRpcProvider;
}

export const useEvmGasSettings = ({ chainId, gasLimit, provider }: UseEvmGasSettingsInput) => {
  const getEvmProvider = useChainAdapterStore(state => state.getEvmProvider);
  const [gasSettings, setGasSettings] = useState<EvmGasSettings>();

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

  useEffect(() => {
    if (!resolvedProvider || !gasLimitValue) {
      setGasSettings(undefined);
      return;
    }

    let isCancelled = false;

    const refreshFeeData = async () => {
      try {
        const feeData = await resolvedProvider.getFeeData();
        if (isCancelled) {
          return;
        }

        setGasSettings(buildEvmGasSettings(feeData, gasLimitValue));
      } catch {
        if (!isCancelled) {
          setGasSettings(undefined);
        }
      }
    };

    void refreshFeeData();
    const intervalId = setInterval(() => {
      void refreshFeeData();
    }, FEE_DATA_POLL_INTERVAL_MS);

    return () => {
      isCancelled = true;
      clearInterval(intervalId);
    };
  }, [gasLimitValue, resolvedProvider]);

  return {
    gasSettings,
    isReady: Boolean(gasSettings && gasLimitValue),
  };
};
