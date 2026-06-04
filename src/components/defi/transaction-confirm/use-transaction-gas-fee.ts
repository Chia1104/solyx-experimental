import { useMemo } from 'react';

import BigNumber from 'bignumber.js';
import type { JsonRpcProvider } from 'ethers';
import { useTranslation } from 'react-i18next';

import { useEvmGasSettings } from '@/modules/chain/hooks/use-evm-gas-settings';
import {
  useQueryEvmGasLimit,
  useQueryLiquidFeeFallback,
  useQueryLiquidPreparedTransaction,
  useQueryTronTransactionFee,
} from '@/modules/chain/hooks/use-query-transaction-confirm';
import { useChainAdapterStore } from '@/modules/chain/stores/chain-adapter';
import type { ChainConfig } from '@/modules/chain/stores/chain-adapter/types';
import { ChainType } from '@/modules/chain/stores/chain-adapter/types';
import type { EvmGasMode } from '@/modules/chain/utils/evm-gas-settings';
import { getEvmGasModeLabelKey } from '@/modules/chain/utils/evm-gas-settings';
import type { TransactionConfirmParams } from '@/modules/chain/utils/transaction-confirm';
import type { TransactionCurrency } from '@/modules/chain/utils/transaction-confirm';
import { formatDisplayValue } from '@/modules/chain/utils/transaction-confirm';

interface TokenRow {
  address: string;
  balance?: string;
  price?: string;
}

export interface UseTransactionGasFeeOptions {
  chainType: ChainType;
  sendParams: TransactionConfirmParams;
  chain: ChainConfig | undefined;
  currency: TransactionCurrency | undefined;
  isNativeCurrency: boolean;
  currentAddress: string;
  nativeCurrencyToken: TokenRow | undefined;
  liquidSubaccountPointer: number | undefined;
  evmGasMode: EvmGasMode;
}

export const useTransactionGasFee = ({
  chainType,
  sendParams,
  chain,
  currency,
  isNativeCurrency,
  currentAddress,
  nativeCurrencyToken,
  liquidSubaccountPointer,
  evmGasMode,
}: UseTransactionGasFeeOptions) => {
  const { t } = useTranslation(['defi', 'global']);
  const getEvmProvider = useChainAdapterStore(state => state.getEvmProvider);

  const toAddress = sendParams.to;
  const value = formatDisplayValue(sendParams.value);

  const evmProvider = useMemo(() => {
    if (chainType !== ChainType.EVM || !chain) {
      return undefined;
    }
    try {
      return getEvmProvider(chain.chainId) as JsonRpcProvider;
    } catch {
      return undefined;
    }
  }, [chain, chainType, getEvmProvider]);

  const evmGasLimitQuery = useQueryEvmGasLimit(
    {
      address: currentAddress,
      chain,
      currency,
      provider: evmProvider,
      sendParams,
      toAddress,
      value,
    },
    { enabled: chainType === ChainType.EVM },
  );

  const { gasSettings: evmGasSettings, isReady: isEvmGasReady } = useEvmGasSettings({
    chainId: chain?.chainId,
    gasLimit: evmGasLimitQuery.data,
    provider: evmProvider,
  });

  const tronFeeQuery = useQueryTronTransactionFee(
    {
      currency,
      isNativeCurrency,
      sendParams,
      toAddress,
      value,
    },
    { enabled: chainType === ChainType.TRON },
  );

  const assetId = sendParams.tokenAddress || chain?.nativeCurrency.address;
  const liquidPreparedQuery = useQueryLiquidPreparedTransaction(
    {
      assetId,
      currencyDecimals: currency?.decimals,
      sendParams,
      subaccountPointer: liquidSubaccountPointer,
    },
    { enabled: chainType === ChainType.LIQUID },
  );
  const liquidFeeFallbackQuery = useQueryLiquidFeeFallback({
    enabled: chainType === ChainType.LIQUID && liquidPreparedQuery.isError,
  });

  const gasFee = useMemo(() => {
    switch (chainType) {
      case ChainType.EVM:
        return evmGasSettings?.[evmGasMode]?.gasFee ?? '-';
      case ChainType.TRON:
        return tronFeeQuery.data ?? '-';
      case ChainType.LIQUID:
        return liquidPreparedQuery.data?.fee ?? liquidFeeFallbackQuery.data ?? '-';
      default:
        return '-';
    }
  }, [
    chainType,
    evmGasMode,
    evmGasSettings,
    liquidFeeFallbackQuery.data,
    liquidPreparedQuery.data?.fee,
    tronFeeQuery.data,
  ]);

  const evmGasModeLabel = useMemo(() => {
    if (chainType !== ChainType.EVM) {
      return undefined;
    }
    return t(getEvmGasModeLabelKey(evmGasMode));
  }, [chainType, evmGasMode, t]);

  const nativeBalance = useMemo(() => {
    if (nativeCurrencyToken?.balance) {
      return new BigNumber(nativeCurrencyToken.balance);
    }
    return new BigNumber('-');
  }, [nativeCurrencyToken?.balance]);

  const isMaximum = useMemo(() => {
    if (!nativeBalance.isFinite() || gasFee === '-' || gasFee === 'null') {
      return false;
    }
    const transferValue = new BigNumber(sendParams.tokenAddress && !isNativeCurrency ? 0 : value);
    return transferValue.plus(gasFee).isGreaterThan(nativeBalance);
  }, [gasFee, isNativeCurrency, nativeBalance, sendParams.tokenAddress, value]);

  const hasTransactionWarning = useMemo(() => {
    if (chainType === ChainType.LIQUID && nativeBalance.toString() === '-') {
      return true;
    }
    if (gasFee === '-' || gasFee === 'null') {
      return chainType === ChainType.LIQUID ? liquidPreparedQuery.isError : false;
    }
    return nativeBalance.isFinite() && nativeBalance.isLessThan(gasFee);
  }, [chainType, gasFee, liquidPreparedQuery.isError, nativeBalance]);

  return {
    gasFee,
    evmProvider,
    evmGasSettings,
    isEvmGasReady,
    evmGasModeLabel,
    isMaximum,
    hasTransactionWarning,
    evmGasLimitQuery,
    liquidPreparedQuery,
  };
};
