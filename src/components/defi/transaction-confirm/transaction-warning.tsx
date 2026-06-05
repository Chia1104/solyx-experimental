import { memo } from 'react';

import { Alert } from 'heroui-native';
import { useTranslation } from 'react-i18next';

import type { ChainType } from '@/modules/chain/stores/chain-adapter/types';
import type { EvmGasMode } from '@/modules/chain/utils/evm-gas-settings';
import type { TransactionConfirmParams } from '@/modules/chain/utils/transaction-confirm';

import { useTransactionConfirmData } from './use-transaction-confirm-data';
import { useTransactionGasFee } from './use-transaction-gas-fee';

interface TransactionWarningProps {
  chainId?: number | string;
  chainType: ChainType;
  evmGasMode: EvmGasMode;
  sendParams: TransactionConfirmParams;
}

export const TransactionWarning = memo(
  ({ chainId, chainType, evmGasMode, sendParams }: TransactionWarningProps) => {
    const { t } = useTranslation(['defi']);
    const {
      currency,
      effectiveAddress,
      effectiveChain,
      isNativeCurrency,
      liquidSubaccountPointer,
      nativeCurrencyToken,
    } = useTransactionConfirmData({ chainId, chainType, sendParams });
    const { hasTransactionWarning } = useTransactionGasFee({
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

    if (!hasTransactionWarning) {
      return null;
    }

    return (
      <Alert className="mt-6 w-full" status="danger">
        <Alert.Indicator />
        <Alert.Content>
          <Alert.Description>{t('defi:notice.transaction.expected.fail')}</Alert.Description>
        </Alert.Content>
      </Alert>
    );
  },
);
