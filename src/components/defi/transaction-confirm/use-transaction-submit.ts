import { useCallback } from 'react';

import { useAsyncThrottledCallback } from '@tanstack/react-pacer';
import type { JsonRpcProvider } from 'ethers';
import { useToast } from 'heroui-native';
import { useTranslation } from 'react-i18next';

import type { UnsignedTransaction } from '@roswell/react-native-gdk';

import { LockScreenError } from '@/modules/app/types/log-request.type';
import { useMutationSendTransaction } from '@/modules/chain/hooks/use-mutation-send-transaction';
import type { SendTransactionVariables } from '@/modules/chain/services/send-transaction';
import type { ChainConfig } from '@/modules/chain/stores/chain-adapter/types';
import { ChainType } from '@/modules/chain/stores/chain-adapter/types';
import type { EvmGasMode, EvmGasSettings } from '@/modules/chain/utils/evm-gas-settings';
import type {
  TransactionConfirmParams,
  TransactionCurrency,
} from '@/modules/chain/utils/transaction-confirm';
import {
  LiquidTransactionNotReadyError,
  TransactionNotReadyError,
  TronTransactionNotReadyError,
  getEvmTransactionErrorType,
  getLiquidTransactionErrorType,
  getTronTransactionErrorType,
} from '@/modules/chain/utils/transaction-confirm';
import { useDefiRecordSync } from '@/modules/defi/hooks/use-defi-record-sync';
import { useMutationTransactionCallBack } from '@/modules/defi/hooks/use-mutation-transaction-callback';

import type { TransactionCallback } from './types';

interface UseTransactionSubmitOptions {
  chain?: ChainConfig;
  chainType: ChainType;
  currency?: TransactionCurrency;
  currentAddress: string;
  currentChainId: number;
  evmGasLimit?: string;
  evmGasMode: EvmGasMode;
  evmGasSettings?: EvmGasSettings;
  evmProvider?: JsonRpcProvider;
  gasFee: string;
  isNativeCurrency: boolean;
  liquidUnsignedTransaction?: UnsignedTransaction;
  onOpenSuccessSheet: () => void;
  onSuccess?: (txHash: string, meta?: { gasFee: string }) => void;
  sendParams: TransactionConfirmParams;
  toAddress: string;
  transactionCallBack?: TransactionCallback;
  value: string;
}

export const useTransactionSubmit = ({
  chain,
  chainType,
  currency,
  currentAddress,
  currentChainId,
  evmGasLimit,
  evmGasMode,
  evmGasSettings,
  evmProvider,
  gasFee,
  isNativeCurrency,
  liquidUnsignedTransaction,
  onOpenSuccessSheet,
  onSuccess,
  sendParams,
  toAddress,
  transactionCallBack,
  value,
}: UseTransactionSubmitOptions) => {
  const { t } = useTranslation(['defi', 'global']);
  const { toast } = useToast();
  const { syncRecords } = useDefiRecordSync();
  const transactionCallBackMutation = useMutationTransactionCallBack();

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

  const getSendTransactionVariables = useCallback((): SendTransactionVariables => {
    if (!chain) {
      throw new TransactionNotReadyError();
    }

    switch (chainType) {
      case ChainType.EVM: {
        const selectedGas = evmGasSettings?.[evmGasMode];
        if (!evmProvider || !selectedGas || gasFee === '-' || !evmGasLimit) {
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
          evmGasLimit,
          selectedGas,
          gasFee,
        };
      }

      case ChainType.TRON:
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

      case ChainType.LIQUID:
        if (!liquidUnsignedTransaction) {
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
          unsignedTransaction: liquidUnsignedTransaction,
          value,
        };

      default:
        throw new Error(`Unsupported chain type: ${chainType}`);
    }
  }, [
    chain,
    chainType,
    currency,
    currentAddress,
    currentChainId,
    evmGasLimit,
    evmGasMode,
    evmGasSettings,
    evmProvider,
    gasFee,
    isNativeCurrency,
    liquidUnsignedTransaction,
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
        onOpenSuccessSheet();
      }

      await syncRecords('latest');
      onSuccess?.(txHash, { gasFee });
    },
    onError: error => {
      if (error instanceof LockScreenError) return;

      toast.show({
        variant: 'danger',
        description: getTransactionErrorMessage(error),
      });
    },
  });

  const sendTransaction = useAsyncThrottledCallback(
    async () => {
      if (sendTransactionMutation.isPending) return;
      await sendTransactionMutation.mutateAsync(getSendTransactionVariables());
    },
    { wait: 1500 },
  );

  return {
    isSending: sendTransactionMutation.isPending,
    sendTransaction,
  };
};
