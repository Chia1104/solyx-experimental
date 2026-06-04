import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { ChainType } from '@/modules/chain/stores/chain-adapter/types';
import type { TransactionConfirmParams } from '@/modules/chain/utils/transaction-confirm';
import { useDefiAccount } from '@/modules/defi/hooks/use-defi-account';

import { GasSettingSheet } from './transaction-confirm/gas-setting-sheet';
import {
  GasFeeCard,
  TransactionActions,
  TransactionAmountSummary,
  TransactionDetails,
  TransactionWarning,
} from './transaction-confirm/shared-ui';
import { TransactionSuccessSheet } from './transaction-confirm/transaction-success-sheet';
import type {
  TransactionCallback,
  UseTransactionConfirmOptions,
} from './transaction-confirm/use-transaction-confirm';
import { useTransactionConfirm } from './transaction-confirm/use-transaction-confirm';

export type { TransactionCallback, TransactionConfirmParams };

export interface TransactionConfirmProps extends Omit<UseTransactionConfirmOptions, 'isInModal'> {
  isInModal?: boolean;
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
  const { chain, currentAddress, wallet } = useDefiAccount();
  const accountName = wallet?.name ?? t('defi:label.setting.current.account');

  const {
    nativeCurrencyToken,
    currencySymbol,
    fiatAmount,
    formattedToAddress,
    value,
    toAddress,
    gasFee,
    evmGasMode,
    setEvmGasMode,
    evmGasSettings,
    isEvmGasReady,
    isGasSheetOpen,
    setIsGasSheetOpen,
    evmGasModeLabel,
    isSending,
    isConfirmDisabled,
    isMaximum,
    hasTransactionWarning,
    onSendTransaction,
    handleCancel,
    isSuccessSheetOpen,
    handleSuccessSheetOpenChange,
    handleGoToActivity,
  } = useTransactionConfirm({
    chainType,
    sendParams,
    isInModal,
    onCancel,
    onDismissAfterSuccess,
    onGoToActivity,
    onSuccess,
    transactionCallBack,
  });

  if (!chain) {
    return null;
  }

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
