import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { useAsyncThrottledCallback } from '@tanstack/react-pacer';
import BigNumber from 'bignumber.js';
import type { JsonRpcProvider } from 'ethers';
import { useToast } from 'heroui-native';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { LockScreenError } from '@/modules/app/types/log-request.type';
import { useEvmGasSettings } from '@/modules/chain/hooks/use-evm-gas-settings';
import { useLiquidSession } from '@/modules/chain/hooks/use-liquid-session';
import { useMutationSendTransaction } from '@/modules/chain/hooks/use-mutation-send-transaction';
import {
  useQueryEvmGasLimit,
  useQueryLiquidFeeFallback,
  useQueryLiquidPreparedTransaction,
  useQueryTronTransactionFee,
} from '@/modules/chain/hooks/use-query-transaction-confirm';
import { useChainAdapterStore } from '@/modules/chain/stores/chain-adapter';
import { ChainType } from '@/modules/chain/stores/chain-adapter/types';
import type { EvmGasMode } from '@/modules/chain/utils/evm-gas-settings';
import { getEvmGasModeLabelKey } from '@/modules/chain/utils/evm-gas-settings';
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
import { useMutationTransactionCallBack } from '@/modules/defi/hooks/use-mutation-transaction-callback';
import { useQueryAssets } from '@/modules/defi/hooks/use-query-assets';

import { GasSettingSheet } from './transaction-confirm/gas-setting-sheet';
import {
  GasFeeCard,
  TransactionActions,
  TransactionAmountSummary,
  TransactionDetails,
  TransactionWarning,
} from './transaction-confirm/shared-ui';
import { TransactionSuccessSheet } from './transaction-confirm/transaction-success-sheet';

export type { TransactionConfirmParams };

type TransactionCallbackPayload = string | { message: string; code: number };
type TransactionCallback = (data: TransactionCallbackPayload) => void;

export interface TransactionConfirmProps {
  chainType: ChainType;
  sendParams: TransactionConfirmParams;
  isInModal?: boolean;
  onCancel?: () => void;
  onDismissAfterSuccess?: () => void;
  onGoToActivity?: () => void;
  onSuccess?: (txHash: string) => void;
  transactionCallBack?: TransactionCallback;
}

export const TransactionConfirm = ({
  chainType,
  sendParams,
  isInModal = false,
  onCancel,
  onDismissAfterSuccess,
  onGoToActivity,
  onSuccess,
  transactionCallBack,
}: TransactionConfirmProps) => {
  const { i18n, t } = useTranslation(['defi', 'global']);
  const { toast } = useToast();
  const successSheetCloseReasonRef = useRef<'activity' | null>(null);
  const [isSuccessSheetOpen, setIsSuccessSheetOpen] = useState(false);
  const { ensureLiquidSession } = useLiquidSession();
  const { chain, currentAddress, currentChainId, liquidSubaccountPointer, wallet } =
    useDefiAccount();
  const { assets, rows } = useQueryAssets();
  const getEvmProvider = useChainAdapterStore(state => state.getEvmProvider);
  const transactionCallBackMutation = useMutationTransactionCallBack();
  const [evmGasMode, setEvmGasMode] = useState<EvmGasMode>('average');
  const [isGasSheetOpen, setIsGasSheetOpen] = useState(false);

  const params = sendParams;
  const toAddress = params.to;
  const value = formatDisplayValue(params.value);
  const accountName = wallet?.name ?? t('defi:label.setting.current.account');

  const currency = assets.find(item => item.address === params.tokenAddress);
  const currentToken = rows.find(row => row.address === params.tokenAddress);
  const nativeCurrencyToken = rows.find(row => row.address === chain?.nativeCurrency.address);

  const isNativeCurrency =
    chain?.nativeCurrency.address.toLocaleUpperCase() === params.tokenAddress?.toLocaleUpperCase();

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
      sendParams: params,
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
      isNativeCurrency: !!isNativeCurrency,
      sendParams: params,
      toAddress,
      value,
    },
    { enabled: chainType === ChainType.TRON },
  );

  const assetId = params.tokenAddress || chain?.nativeCurrency.address;
  const liquidPreparedQuery = useQueryLiquidPreparedTransaction(
    {
      assetId,
      currencyDecimals: currency?.decimals,
      sendParams: params,
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

    const transferValue = new BigNumber(params.tokenAddress && !isNativeCurrency ? 0 : value);
    return transferValue.plus(gasFee).isGreaterThan(nativeBalance);
  }, [gasFee, isNativeCurrency, nativeBalance, params.tokenAddress, value]);

  const hasTransactionWarning = useMemo(() => {
    if (chainType === ChainType.LIQUID && nativeBalance.toString() === '-') {
      return true;
    }

    if (gasFee === '-' || gasFee === 'null') {
      return chainType === ChainType.LIQUID ? liquidPreparedQuery.isError : false;
    }

    return nativeBalance.isFinite() && nativeBalance.isLessThan(gasFee);
  }, [chainType, gasFee, liquidPreparedQuery.isError, nativeBalance]);

  const fiatAmount = useMemo(() => {
    return new BigNumber(value || '0').multipliedBy(currentToken?.price ?? '0').toNumber();
  }, [currentToken?.price, value]);

  const formattedToAddress = useMemo(() => {
    if (chainType === ChainType.LIQUID) {
      return formatLiquidAddress(toAddress);
    }
    return undefined;
  }, [chainType, toAddress]);

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
          sendParams: params,
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
          isNativeCurrency: !!isNativeCurrency,
          sendParams: params,
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
          currentChainId,
          unsignedTransaction: liquidPreparedQuery.data.unsignedTransaction,
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
    params,
    toAddress,
    value,
  ]);

  const sendTransactionMutation = useMutationSendTransaction({
    onSuccess: async txHash => {
      if (!txHash) {
        return;
      }

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

      if (!params.suppressSuccessModal) {
        setIsSuccessSheetOpen(true);
      }

      onSuccess?.(txHash);
    },
    onError: error => {
      if (error instanceof LockScreenError) {
        return;
      }

      toast.show({
        variant: 'danger',
        description: getTransactionErrorMessage(error),
      });
    },
  });

  const isSending = sendTransactionMutation.isPending;
  const isConfirmDisabled = useMemo(() => {
    if (isMaximum || gasFee === '-' || isSending) {
      return true;
    }

    if (chainType === ChainType.EVM) {
      return !isEvmGasReady || evmGasLimitQuery.isLoading;
    }

    if (chainType === ChainType.LIQUID) {
      return !liquidPreparedQuery.data;
    }

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
      if (sendTransactionMutation.isPending) {
        return;
      }
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
      transactionCallBack?.({
        message: 'The request is rejected by the user.',
        code: 4001,
      });
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

  if (!chain) {
    return null;
  }

  const currencySymbol = currency?.symbol ?? chain.nativeCurrency.symbol;

  return (
    <View className="px-6 pb-6">
      <TransactionAmountSummary
        currencySymbol={currencySymbol}
        fiatAmount={fiatAmount}
        locale={i18n.language}
        nativeCurrencySymbol={chain.nativeCurrency.symbol}
        value={value}
      />

      <TransactionDetails
        accountName={accountName}
        address={currentAddress}
        formattedToAddress={formattedToAddress}
        isInModal={isInModal}
        networkName={chain.name}
        toAddress={toAddress}
      />

      {chainType === ChainType.EVM ? (
        <GasSettingSheet
          gasSettings={evmGasSettings}
          isOpen={isGasSheetOpen}
          locale={i18n.language}
          nativePrice={nativeCurrencyToken?.price}
          nativeSymbol={chain.nativeCurrency.symbol}
          onOpenChange={setIsGasSheetOpen}
          onSelect={setEvmGasMode}
          selectedMode={evmGasMode}
        />
      ) : null}

      <TransactionSuccessSheet
        isOpen={isSuccessSheetOpen}
        onGoToActivity={handleGoToActivity}
        onOpenChange={handleSuccessSheetOpenChange}
      />

      <GasFeeCard
        gasFee={gasFee}
        gasModeLabel={evmGasModeLabel}
        isMaximum={isMaximum}
        isPressable={chainType === ChainType.EVM && isEvmGasReady}
        locale={i18n.language}
        nativeCurrency={chain.nativeCurrency}
        nativeCurrencyToken={nativeCurrencyToken}
        onPress={
          chainType === ChainType.EVM && isEvmGasReady ? () => setIsGasSheetOpen(true) : undefined
        }
      />

      {hasTransactionWarning ? <TransactionWarning /> : null}

      <TransactionActions
        disabled={isConfirmDisabled}
        isSending={isSending}
        onCancel={handleCancel}
        onConfirm={onSendTransaction}
      />
    </View>
  );
};
