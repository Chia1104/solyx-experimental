import { memo, useCallback, useMemo, useState } from 'react';

import { Button } from 'heroui-native';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { ChainType } from '@/modules/chain/stores/chain-adapter/types';
import type { EvmGasMode } from '@/modules/chain/utils/evm-gas-settings';
import type { TransactionConfirmParams } from '@/modules/chain/utils/transaction-confirm';

import { TransactionSuccessSheet } from './transaction-success-sheet';
import type { TransactionCallback } from './types';
import { useTransactionConfirmData } from './use-transaction-confirm-data';
import { useTransactionGasFee } from './use-transaction-gas-fee';
import { useTransactionSubmit } from './use-transaction-submit';

interface TransactionActionsProps {
  chainId?: number | string;
  chainType: ChainType;
  confirmLabel?: string;
  evmGasMode: EvmGasMode;
  extraDisabled?: boolean;
  onDismissAfterSuccess?: () => void;
  onCancel?: () => void;
  onGoToActivity?: () => void;
  onSuccess?: (txHash: string, meta?: { gasFee: string }) => void;
  sendParams: TransactionConfirmParams;
  transactionCallBack?: TransactionCallback;
}

export const TransactionActions = memo(
  ({
    chainId,
    chainType,
    confirmLabel,
    evmGasMode,
    extraDisabled,
    onDismissAfterSuccess,
    onCancel,
    onGoToActivity,
    onSuccess,
    sendParams,
    transactionCallBack,
  }: TransactionActionsProps) => {
    const { t } = useTranslation(['defi', 'global']);
    const [isSuccessSheetOpen, setIsSuccessSheetOpen] = useState(false);
    const {
      currency,
      currentChainId,
      effectiveAddress,
      effectiveChain,
      isNativeCurrency,
      liquidSubaccountPointer,
      nativeCurrencyToken,
      toAddress,
      value,
    } = useTransactionConfirmData({ chainId, chainType, sendParams });
    const {
      gasFee,
      evmProvider,
      evmGasSettings,
      isEvmGasReady,
      isMaximum,
      evmGasLimitQuery,
      liquidPreparedQuery,
    } = useTransactionGasFee({
      chainType,
      sendParams,
      chain: effectiveChain,
      currency,
      isNativeCurrency,
      currentAddress: effectiveAddress,
      nativeCurrencyToken,
      liquidSubaccountPointer,
      evmGasMode,
    });
    const { isSending, sendTransaction } = useTransactionSubmit({
      chain: effectiveChain,
      chainType,
      currency,
      currentAddress: effectiveAddress,
      currentChainId,
      evmGasLimit: evmGasLimitQuery.data,
      evmGasMode,
      evmGasSettings,
      evmProvider,
      gasFee,
      isNativeCurrency,
      liquidUnsignedTransaction: liquidPreparedQuery.data?.unsignedTransaction,
      onOpenSuccessSheet: () => setIsSuccessSheetOpen(true),
      onSuccess,
      sendParams,
      toAddress,
      transactionCallBack,
      value,
    });

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

    const handleCancel = useCallback(() => {
      if (onCancel) {
        onCancel();
        return;
      }

      if (chainType !== ChainType.LIQUID) {
        transactionCallBack?.({ message: 'The request is rejected by the user.', code: 4001 });
      }
    }, [chainType, onCancel, transactionCallBack]);

    return (
      <>
        <TransactionSuccessSheet
          isOpen={isSuccessSheetOpen}
          onDismissAfterSuccess={onDismissAfterSuccess}
          onGoToActivity={onGoToActivity}
          onOpenChange={setIsSuccessSheetOpen}
        />
        <View className="mt-6 flex-row gap-2">
          <Button className="flex-1" onPress={handleCancel} size="sm" variant="outline">
            <Button.Label>{t('global:action.cancel')}</Button.Label>
          </Button>
          <Button
            className="flex-1"
            isDisabled={isConfirmDisabled || extraDisabled || isSending}
            onPress={sendTransaction}
            size="sm"
            variant="primary"
          >
            <Button.Label>{confirmLabel ?? t('global:action.confirm')}</Button.Label>
          </Button>
        </View>
      </>
    );
  },
);
