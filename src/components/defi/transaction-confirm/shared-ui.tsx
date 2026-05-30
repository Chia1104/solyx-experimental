import { memo } from 'react';

import BigNumber from 'bignumber.js';
import { Alert, Button, Surface, Typography } from 'heroui-native';
import { NumberValue } from 'heroui-native-pro/number-value';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import { CopyAction } from '@/components/ui/copy-action';
import { ThemedIcon } from '@/components/ui/themed-icon';

import { GasFeeAmountDetails } from './gas-fee-display';

interface TokenQuote {
  price?: string;
}

interface NativeCurrencyInfo {
  symbol: string;
}

export const TransactionAmountSummary = memo(
  ({
    currencySymbol,
    fiatAmount,
    locale,
    nativeCurrencySymbol,
    value,
  }: {
    currencySymbol?: string;
    fiatAmount?: number;
    locale: string;
    nativeCurrencySymbol: string;
    value: string;
  }) => {
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
          locale={locale}
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
            {currencySymbol ?? nativeCurrencySymbol}
          </NumberValue.Suffix>
        </NumberValue>
        {typeof fiatAmount === 'number' ? (
          <NumberValue
            classNames={{ value: 'text-default-foreground mt-1 text-sm' }}
            currency="USD"
            locale={locale}
            maximumFractionDigits={2}
            numberStyle="currency"
            value={fiatAmount}
          />
        ) : null}
      </View>
    );
  },
);

export const TransactionDetails = memo(
  ({
    accountName,
    address,
    formattedToAddress,
    isInModal,
    networkName,
    toAddress,
  }: {
    accountName: string;
    address: string;
    formattedToAddress?: string;
    isInModal?: boolean;
    networkName?: string;
    toAddress: string;
  }) => {
    const { t } = useTranslation(['defi', 'global']);

    return (
      <View className="mt-12 mb-9 gap-4">
        {isInModal ? (
          <View className="flex-row items-center justify-between">
            <Typography className="text-foreground" type="body">
              {t('defi:title.dapp')}
            </Typography>
            <View className="bg-content2 h-6 w-6 rounded-full" />
          </View>
        ) : null}

        <View className="flex-row items-start justify-between gap-3">
          <Typography className="text-default-foreground shrink-0" type="body">
            {t('defi:label.to')}
          </Typography>
          <View className="max-w-[65%] flex-row items-center gap-1">
            <Typography className="text-foreground shrink text-right" type="body">
              {formattedToAddress ?? toAddress}
            </Typography>
            <CopyAction value={toAddress} />
          </View>
        </View>

        <View className="flex-row items-center justify-between gap-3">
          <Typography className="text-default-foreground" type="body">
            {t('defi:label.from')}
          </Typography>
          <Typography className="text-foreground text-right" type="body">
            {accountName} ({`${address.substring(0, 6)}...${address.substring(address.length - 4)}`}
            )
          </Typography>
        </View>

        <View className="flex-row items-center justify-between gap-3">
          <Typography className="text-default-foreground" type="body">
            {t('defi:label.network')}
          </Typography>
          <Typography className="text-foreground text-right" type="body">
            {networkName}
          </Typography>
        </View>
      </View>
    );
  },
);

export const GasFeeCard = memo(
  ({
    gasFee,
    gasModeLabel,
    isMaximum,
    isPressable,
    locale,
    nativeCurrency,
    nativeCurrencyToken,
    onPress,
  }: {
    gasFee: string;
    gasModeLabel?: string;
    isMaximum: boolean;
    isPressable?: boolean;
    locale: string;
    nativeCurrency: NativeCurrencyInfo;
    nativeCurrencyToken?: TokenQuote;
    onPress?: () => void;
  }) => {
    const { t } = useTranslation(['defi', 'global']);

    const content = (
      <Surface className="rounded-lg p-3">
        <View className="flex-row items-center justify-between">
          <Typography className="text-default-foreground" type="body">
            {t('defi:label.gas.fee')}
          </Typography>
          <View className="flex-row items-center">
            <View className="mr-2">
              <GasFeeAmountDetails
                align="end"
                gasFee={gasFee}
                gasModeLabel={gasModeLabel}
                insufficientBalance={isMaximum}
                locale={locale}
                nativePrice={nativeCurrencyToken?.price}
                nativeSymbol={nativeCurrency.symbol}
                showUnavailable={gasFee === 'null'}
              />
            </View>
            {isPressable ? (
              <ThemedIcon className="text-foreground" name="chevron-forward" size={20} />
            ) : null}
          </View>
        </View>
      </Surface>
    );

    if (!isPressable || !onPress) {
      return content;
    }

    return (
      <Pressable accessibilityRole="button" onPress={onPress}>
        {content}
      </Pressable>
    );
  },
);

export const TransactionWarning = memo(() => {
  const { t } = useTranslation(['defi']);

  return (
    <Alert className="mt-6 w-full" status="danger">
      <Alert.Indicator />
      <Alert.Content>
        <Alert.Description>{t('defi:notice.transaction.expected.fail')}</Alert.Description>
      </Alert.Content>
    </Alert>
  );
});

export const TransactionActions = memo(
  ({
    confirmLabel,
    disabled,
    isSending,
    onCancel,
    onConfirm,
  }: {
    confirmLabel?: string;
    disabled: boolean;
    isSending?: boolean;
    onCancel: () => void;
    onConfirm: () => void;
  }) => {
    const { t } = useTranslation(['defi', 'global']);

    return (
      <View className="mt-6 flex-row gap-2">
        <Button className="flex-1" onPress={onCancel} size="sm" variant="outline">
          <Button.Label>{t('global:action.cancel')}</Button.Label>
        </Button>
        <Button
          className="flex-1"
          isDisabled={disabled || isSending}
          onPress={onConfirm}
          size="sm"
          variant="primary"
        >
          <Button.Label>{confirmLabel ?? t('global:action.confirm')}</Button.Label>
        </Button>
      </View>
    );
  },
);
