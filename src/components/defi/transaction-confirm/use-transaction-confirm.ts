import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { useAsyncThrottledCallback } from '@tanstack/react-pacer';
import BigNumber from 'bignumber.js';
import { useToast } from 'heroui-native';
import { useTranslation } from 'react-i18next';
import { is } from 'zod/v4/locales';

import { LockScreenError } from '@/modules/app/types/log-request.type';
import { useLiquidSession } from '@/modules/chain/hooks/use-liquid-session';
import { useMutationSendTransaction } from '@/modules/chain/hooks/use-mutation-send-transaction';
import { ChainType } from '@/modules/chain/stores/chain-adapter/types';
import type { EvmGasMode } from '@/modules/chain/utils/evm-gas-settings';
import type { TransactionConfirmParams } from '@/modules/chain/utils/transaction-confirm';
import {
  LiquidTransactionNotReadyError,
  TransactionNotReadyError,
  TronTransactionNotReadyError,
  formatDisplayValue,
  formatLiquidAddress,
  getEvmTransactionErrorType,
  getLiquidTransactionErrorType,
  getTronTransactionErrorType,
} from '@/modules/chain/utils/transaction-confirm';
import { useDefiAccount } from '@/modules/defi/hooks/use-defi-account';
import { useDefiRecordSync } from '@/modules/defi/hooks/use-defi-record-sync';
import { useMutationTransactionCallBack } from '@/modules/defi/hooks/use-mutation-transaction-callback';
import { useQueryAssets } from '@/modules/defi/hooks/use-query-assets';

import { useTransactionGasFee } from './use-transaction-gas-fee';

export type TransactionCallbackPayload = string | { message: string; code: number };
export type TransactionCallback = (data: TransactionCallbackPayload) => void;

export interface UseTransactionConfirmOptions {
  chainType: ChainType;
  sendParams: TransactionConfirmParams;
  isInModal?: boolean;
  onCancel?: () => void;
  onDismissAfterSuccess?: () => void;
  onGoToActivity?: () => void;
  onSuccess?: (txHash: string) => void;
  transactionCallBack?: TransactionCallback;
}

export const useTransactionConfirm = ({
  chainType,
  sendParams,
  onCancel,
  onDismissAfterSuccess,
  onGoToActivity,
  onSuccess,
  transactionCallBack,
}: UseTransactionConfirmOptions) => {
  const { t } = useTranslation(['defi', 'global']);
  const { toast } = useToast();
  const successSheetCloseReasonRef = useRef<'activity' | null>(null);
  const [isSuccessSheetOpen, setIsSuccessSheetOpen] = useState(false);
  const [evmGasMode, setEvmGasMode] = useState<EvmGasMode>('average');
  const [isGasSheetOpen, setIsGasSheetOpen] = useState(false);

  const { ensureLiquidSession } = useLiquidSession();
  const { chain, currentAddress, currentChainId, liquidSubaccountPointer, wallet } =
    useDefiAccount();
  const { syncRecords } = useDefiRecordSync();
  const { assets, rows } = useQueryAssets();
  const transactionCallBackMutation = useMutationTransactionCallBack();

  const toAddress = sendParams.to;
  const value = formatDisplayValue(sendParams.value);

  const currency = assets.find(item => item.address === sendParams.tokenAddress);
  const currentToken = rows.find(row => row.address === sendParams.tokenAddress);
  const nativeCurrencyToken = rows.find(row => row.address === chain?.nativeCurrency.address);
  const currencySymbol = currency?.symbol ?? chain?.nativeCurrency.symbol ?? '';

  const isNativeCurrency =
    chain?.nativeCurrency.address.toLocaleUpperCase() ===
    sendParams.tokenAddress?.toLocaleUpperCase();

  const {
    gasFee,
    evmProvider,
    evmGasSettings,
    isEvmGasReady,
    evmGasModeLabel,
    isMaximum,
    hasTransactionWarning,
    evmGasLimitQuery,
    liquidPreparedQuery,
  } = useTransactionGasFee({
    chainType,
    sendParams,
    chain,
    currency,
    isNativeCurrency,
    currentAddress,
    nativeCurrencyToken,
    liquidSubaccountPointer,
    evmGasMode,
  });

  const fiatAmount = useMemo(
    () => new BigNumber(value || '0').multipliedBy(currentToken?.price ?? '0').toNumber(),
    [currentToken?.price, value],
  );

  const formattedToAddress = useMemo(
    () => (chainType === ChainType.LIQUID ? formatLiquidAddress(toAddress) : undefined),
    [chainType, toAddress],
  );

  useEffect(() => {
    if (chainType === ChainType.LIQUID) {
      void ensureLiquidSession(currentChainId);
    }
  }, [chainType, currentChainId, ensureLiquidSession]);

  const getTransactionErrorMessage = useCallback(
    (error: unknown) => {
      if (chainType === ChainType.EVM) {
        switch (getEvmTransactionErrorType(error)) {
          case 'transactionNotReady':
            return t('defi:error.transaction.not.ready');
          case 'userRejected':
            return t('global:error.keychain.canceled');
          case 'insufficientFunds':
            return t('defi:error.insufficient.funds.for.fees');
          case 'gasEstimation':
            return t('defi:error.amount.calculate.gas.fee');
          case 'network':
            return t('global:notice.no-network.description');
          case 'nonce':
          case 'transactionFailed':
            return t('defi:error.send.transaction');
          default:
            return t('defi:error.unknown.error');
        }
      }
      if (chainType === ChainType.TRON) {
        switch (getTronTransactionErrorType(error)) {
          case 'transactionNotReady':
            return t('defi:error.transaction.not.ready');
          case 'userRejected':
            return t('global:error.keychain.canceled');
          case 'resourceInsufficient':
            return t('defi:error.tron.resource.insufficient');
          case 'insufficientFunds':
            return t('defi:error.insufficient.funds.for.fees');
          case 'network':
            return t('global:notice.no-network.description');
          case 'transactionFailed':
            return t('defi:error.send.transaction');
          default:
            return t('defi:error.unknown.error');
        }
      }
      switch (getLiquidTransactionErrorType(error)) {
        case 'transactionNotReady':
          return t('defi:error.transaction.not.ready');
        case 'amountBelowMinimum':
          return t('defi:amount.below.minimum.transaction');
        case 'insufficientFunds':
          return t('defi:error.insufficient.funds.for.fees');
        case 'rateLimited':
        case 'network':
          return t('defi:error.amount.calculate.gas.fee');
        case 'transactionFailed':
          return t('defi:error.send.transaction');
        default:
          return t('defi:error.unknown.error');
      }
    },
    [chainType, t],
  );

  const getSendTransactionVariables = useCallback(() => {
    if (!chain) {
      throw new TransactionNotReadyError();
    }
    switch (chainType) {
      case ChainType.EVM: {
        const selectedGas = evmGasSettings?.[evmGasMode];
        if (!evmProvider || !selectedGas || gasFee === '-' || !evmGasLimitQuery.data) {
          throw new TransactionNotReadyError();
        }
        return {
          chainType: ChainType.EVM,
          currentChainId,
          currentAddress,
          chain,
          currency,
          sendParams,
          toAddress,
          value,
          evmProvider,
          evmGasLimit: evmGasLimitQuery.data,
          selectedGas,
          gasFee,
        };
      }
      case ChainType.TRON: {
        if (gasFee === '-' || !toAddress) {
          throw new TronTransactionNotReadyError();
        }
        return {
          chainType: ChainType.TRON,
          currentChainId,
          chain,
          currency,
          gasFee,
          isNativeCurrency,
          sendParams,
          toAddress,
          value,
        };
      }
      case ChainType.LIQUID: {
        if (!liquidPreparedQuery.data?.unsignedTransaction) {
          throw new LiquidTransactionNotReadyError();
        }
        return {
          chainType: ChainType.LIQUID,
          chain,
          currency,
          currentAddress,
          currentChainId,
          gasFee,
          toAddress,
          unsignedTransaction: liquidPreparedQuery.data.unsignedTransaction,
          value,
        };
      }
      default:
        throw new Error(`Unsupported chain type: ${chainType}`);
    }
  }, [
    chain,
    chainType,
    currency,
    currentAddress,
    currentChainId,
    evmGasLimitQuery.data,
    evmGasMode,
    evmGasSettings,
    evmProvider,
    gasFee,
    isNativeCurrency,
    liquidPreparedQuery.data?.unsignedTransaction,
    sendParams,
    toAddress,
    value,
  ]);

  const sendTransactionMutation = useMutationSendTransaction({
    onSuccess: async txHash => {
      if (!txHash) return;
      if (chainType !== ChainType.LIQUID) {
        transactionCallBack?.(txHash);
        if (chain) {
          await transactionCallBackMutation.mutateAsync({
            chainId: chain.chainId.toString(),
            address: currentAddress,
            txId: txHash,
          });
        }
      }
      if (!sendParams.suppressSuccessModal) {
        setIsSuccessSheetOpen(true);
      }
      await syncRecords('latest');
      onSuccess?.(txHash);
    },
    onError: error => {
      if (error instanceof LockScreenError) return;
      toast.show({
        variant: 'danger',
        description: getTransactionErrorMessage(error),
      });
    },
  });

  const isSending = sendTransactionMutation.isPending;

  const isConfirmDisabled = useMemo(() => {
    if (isMaximum || gasFee === '-' || isSending) return true;
    if (chainType === ChainType.EVM) return !isEvmGasReady || evmGasLimitQuery.isLoading;
    if (chainType === ChainType.LIQUID) return !liquidPreparedQuery.data;
    return false;
  }, [
    chainType,
    evmGasLimitQuery.isLoading,
    gasFee,
    isEvmGasReady,
    isMaximum,
    isSending,
    liquidPreparedQuery.data,
  ]);

  const onSendTransaction = useAsyncThrottledCallback(
    async () => {
      if (sendTransactionMutation.isPending) return;
      await sendTransactionMutation.mutateAsync(getSendTransactionVariables());
    },
    { wait: 1500 },
  );

  const handleCancel = useCallback(() => {
    if (onCancel) {
      onCancel();
      return;
    }
    if (chainType !== ChainType.LIQUID) {
      transactionCallBack?.({ message: 'The request is rejected by the user.', code: 4001 });
    }
  }, [chainType, onCancel, transactionCallBack]);

  const handleSuccessSheetOpenChange = useCallback(
    (open: boolean) => {
      setIsSuccessSheetOpen(open);
      if (!open) {
        if (successSheetCloseReasonRef.current === 'activity') {
          successSheetCloseReasonRef.current = null;
          return;
        }
        onDismissAfterSuccess?.();
      }
    },
    [onDismissAfterSuccess],
  );

  const handleGoToActivity = useCallback(() => {
    successSheetCloseReasonRef.current = 'activity';
    setIsSuccessSheetOpen(false);
    onGoToActivity?.();
  }, [onGoToActivity]);

  return {
    // token / display
    currency,
    nativeCurrencyToken,
    currencySymbol,
    fiatAmount,
    formattedToAddress,
    value,
    toAddress,
    // gas
    gasFee,
    evmGasMode,
    setEvmGasMode,
    evmGasSettings,
    isEvmGasReady,
    isGasSheetOpen,
    setIsGasSheetOpen,
    evmGasModeLabel,
    // tx state
    isSending,
    isConfirmDisabled,
    isMaximum,
    hasTransactionWarning,
    // handlers
    onSendTransaction,
    handleCancel,
    // success sheet
    isSuccessSheetOpen,
    handleSuccessSheetOpenChange,
    handleGoToActivity,
  };
};
