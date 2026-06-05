import { useState } from 'react';

import { View } from 'react-native';

import type { EvmGasMode } from '@/modules/chain/utils/evm-gas-settings';
import type { TransactionConfirmParams } from '@/modules/chain/utils/transaction-confirm';

import { TransactionActions } from './transaction-actions';
import { TransactionAmountSummary } from './transaction-amount-summary';
import { TransactionDetails } from './transaction-details';
import { TransactionGasFeeSection } from './transaction-gas-fee-section';
import { TransactionWarning } from './transaction-warning';
import type { TransactionCallback, UseTransactionConfirmOptions } from './use-transaction-confirm';

export type { TransactionCallback, TransactionConfirmParams };

export interface TransactionConfirmProps extends UseTransactionConfirmOptions {
  chainId?: number | string;
  isInModal?: boolean;
  onCancel?: () => void;
  onDismissAfterSuccess?: () => void;
  onGoToActivity?: () => void;
}

export const TransactionConfirm = ({
  chainId,
  chainType,
  sendParams,
  isInModal = false,
  onCancel,
  onDismissAfterSuccess,
  onGoToActivity,
  onSuccess,
  transactionCallBack,
}: TransactionConfirmProps) => {
  const [evmGasMode, setEvmGasMode] = useState<EvmGasMode>('average');

  return (
    <View className="px-6 pb-6">
      <TransactionAmountSummary chainId={chainId} chainType={chainType} sendParams={sendParams} />

      <TransactionDetails
        chainId={chainId}
        chainType={chainType}
        isInModal={isInModal}
        sendParams={sendParams}
      />

      <TransactionGasFeeSection
        chainId={chainId}
        chainType={chainType}
        evmGasMode={evmGasMode}
        onSelectGasMode={setEvmGasMode}
        sendParams={sendParams}
      />

      <TransactionWarning
        chainId={chainId}
        chainType={chainType}
        evmGasMode={evmGasMode}
        sendParams={sendParams}
      />

      <TransactionActions
        chainId={chainId}
        chainType={chainType}
        evmGasMode={evmGasMode}
        onDismissAfterSuccess={onDismissAfterSuccess}
        onCancel={onCancel}
        onGoToActivity={onGoToActivity}
        onSuccess={onSuccess}
        sendParams={sendParams}
        transactionCallBack={transactionCallBack}
      />
    </View>
  );
};
