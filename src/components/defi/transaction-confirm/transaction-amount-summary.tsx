import { memo } from 'react';

import BigNumber from 'bignumber.js';
import { NumberValue } from 'heroui-native-pro/number-value';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import type { ChainType } from '@/modules/chain/stores/chain-adapter/types';
import type { TransactionConfirmParams } from '@/modules/chain/utils/transaction-confirm';

import { useTransactionConfirmData } from './use-transaction-confirm-data';

interface TransactionAmountSummaryProps {
  chainId?: number | string;
  chainType: ChainType;
  sendParams: TransactionConfirmParams;
}

export const TransactionAmountSummary = memo(
  ({ chainId, chainType, sendParams }: TransactionAmountSummaryProps) => {
    const { i18n } = useTranslation();
    const { currencySymbol, effectiveChain, fiatAmount, value } = useTransactionConfirmData({
      chainId,
      chainType,
      sendParams,
    });

    if (!new BigNumber(value).isGreaterThan(0)) {
      return null;
    }

    const numericValue = new BigNumber(value).toNumber();
    const fontSize = Math.max(25, 36 - (value.length / 18) * (36 - 25));

    return (
      <View className="items-center">
        <NumberValue
          classNames={{
            container: 'flex-row items-end justify-center',
            value: 'text-foreground font-bold',
          }}
          locale={i18n.language}
          maximumFractionDigits={8}
          styles={{
            value: {
              fontSize,
              includeFontPadding: false,
              lineHeight: fontSize * 1.15,
            },
          }}
          value={-numericValue}
        >
          <NumberValue.Value />
          <NumberValue.Suffix className="text-foreground mb-1.5 ml-1 text-base">
            {currencySymbol || effectiveChain?.nativeCurrency.symbol}
          </NumberValue.Suffix>
        </NumberValue>
        {typeof fiatAmount === 'number' ? (
          <NumberValue
            classNames={{ value: 'text-default-foreground mt-1 text-sm' }}
            currency="USD"
            locale={i18n.language}
            maximumFractionDigits={2}
            numberStyle="currency"
            value={fiatAmount}
          />
        ) : null}
      </View>
    );
  },
);
