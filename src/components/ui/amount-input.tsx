import type { ReactNode } from 'react';

import BigNumber from 'bignumber.js';
import { FieldError, Text, cn } from 'heroui-native';
import { NumberField } from 'heroui-native-pro/number-field';
import { NumberValue } from 'heroui-native-pro/number-value';
import { View } from 'react-native';

interface AmountInputClassNames {
  errorContainer?: string;
  fiatValue?: string;
  group?: string;
  input?: string;
  root?: string;
  symbol?: string;
  valueContainer?: string;
}

interface AmountInputProps {
  classNames?: AmountInputClassNames;
  decimals: number;
  error?: ReactNode;
  fiatAmount: number;
  isInvalid?: boolean;
  locale: string;
  onBlur?: () => void;
  onChange: (value: string) => void;
  placeholder?: string;
  symbol?: string;
  value: string;
}

const toCommittedAmountValue = (value: number | string, decimals: number) => {
  try {
    if (!new BigNumber(value).isFinite()) {
      return '';
    }

    return new BigNumber(value).decimalPlaces(decimals, BigNumber.ROUND_DOWN).toString();
  } catch {
    return '';
  }
};

const normalizeAmountText = (value: string, decimals: number) => {
  const normalized = value.replace(/[^\d.]/g, '');
  const [integer = '', ...fractionParts] = normalized.split('.');
  const fraction = fractionParts.join('');

  if (!normalized.includes('.')) {
    return integer;
  }

  return `${integer || '0'}.${fraction.slice(0, decimals)}`;
};

const toBigNumberOrNull = (value: string) => {
  if (!value.trim()) {
    return null;
  }

  try {
    const amount = new BigNumber(value);
    return amount.isFinite() ? amount : null;
  } catch {
    return null;
  }
};

const toNumberFieldValue = (value: string) => toBigNumberOrNull(value)?.toNumber() ?? Number.NaN;

export const AmountInput = ({
  classNames,
  decimals,
  error,
  fiatAmount,
  isInvalid = false,
  locale,
  onBlur,
  onChange,
  placeholder = '0',
  symbol,
  value,
}: AmountInputProps) => {
  return (
    <NumberField
      className={cn('w-full', classNames?.root)}
      formatOptions={{
        maximumFractionDigits: decimals,
        minimumFractionDigits: 0,
        useGrouping: false,
      }}
      isInvalid={isInvalid}
      minValue={0}
      onChange={nextValue => onChange(toCommittedAmountValue(nextValue, decimals))}
      step={new BigNumber(10).pow(-Math.min(decimals, 8)).toNumber()}
      value={toNumberFieldValue(value)}
    >
      <NumberField.Group
        className={cn(
          'min-h-11 flex-row items-end justify-center bg-transparent',
          classNames?.group,
        )}
      >
        <NumberField.Input
          autoCapitalize="none"
          autoCorrect={false}
          className={cn(
            'text-foreground max-w-[220px] border-0 bg-transparent px-0 py-0 text-center text-4xl font-normal',
            classNames?.input,
          )}
          isAutoPaddingActive={false}
          keyboardType="decimal-pad"
          onBlur={() => {
            onChange(toCommittedAmountValue(value, decimals));
            onBlur?.();
          }}
          onChangeText={nextValue => onChange(normalizeAmountText(nextValue, decimals))}
          placeholder={placeholder}
          value={value}
        />
        {symbol ? (
          <Text className={cn('text-foreground pb-2', classNames?.symbol)} type="body-sm">
            {symbol}
          </Text>
        ) : null}
      </NumberField.Group>
      <View className={cn('items-center', classNames?.valueContainer)}>
        <NumberValue
          classNames={{
            value: cn('text-default-foreground text-xs', classNames?.fiatValue),
          }}
          currency="USD"
          locale={locale}
          maximumFractionDigits={2}
          numberStyle="currency"
          value={fiatAmount}
        />
        <View className={cn('h-12 items-center justify-center', classNames?.errorContainer)}>
          <FieldError>{error}</FieldError>
        </View>
      </View>
    </NumberField>
  );
};
