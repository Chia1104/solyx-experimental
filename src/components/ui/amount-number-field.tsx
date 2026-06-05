import type { ReactNode } from 'react';

import BigNumber from 'bignumber.js';
import { FieldError, cn } from 'heroui-native';
import { NumberField } from 'heroui-native-pro/number-field';
import { View } from 'react-native';

export interface AmountNumberFieldClassNames {
  errorContainer?: string;
  footer?: string;
  input?: string;
  inputGroup?: string;
  root?: string;
}

export interface AmountNumberFieldProps {
  classNames?: AmountNumberFieldClassNames;
  decimalPlaces: number;
  error?: ReactNode;
  footer?: ReactNode;
  isDisabled?: boolean;
  isInvalid?: boolean;
  onBlur?: () => void;
  onChange?: (amount: string) => void;
  placeholder?: string;
  prefix?: ReactNode;
  suffix?: ReactNode;
  value: string;
}

const toCommittedAmountValue = (value: number | string, decimalPlaces: number) => {
  try {
    if (!new BigNumber(value).isFinite()) {
      return '';
    }

    return new BigNumber(value).decimalPlaces(decimalPlaces, BigNumber.ROUND_DOWN).toString();
  } catch {
    return '';
  }
};

const normalizeAmountText = (value: string, decimalPlaces: number) => {
  const normalized = value.replace(/[^\d.]/g, '');
  const [integer = '', ...fractionParts] = normalized.split('.');
  const fraction = fractionParts.join('');

  if (!normalized.includes('.')) {
    return integer;
  }

  return `${integer || '0'}.${fraction.slice(0, decimalPlaces)}`;
};

const toNumberFieldValue = (value: string) => {
  if (!value.trim()) {
    return Number.NaN;
  }

  try {
    const amount = new BigNumber(value);
    return amount.isFinite() ? amount.toNumber() : Number.NaN;
  } catch {
    return Number.NaN;
  }
};

export const AmountNumberField = ({
  classNames,
  decimalPlaces,
  error,
  footer,
  isDisabled,
  isInvalid,
  onBlur,
  onChange,
  placeholder = '0',
  prefix,
  suffix,
  value,
}: AmountNumberFieldProps) => (
  <NumberField
    className={cn('w-full', classNames?.root)}
    formatOptions={{
      maximumFractionDigits: decimalPlaces,
      minimumFractionDigits: 0,
      useGrouping: false,
    }}
    isInvalid={isInvalid}
    minValue={0}
    onChange={nextValue => onChange?.(toCommittedAmountValue(nextValue, decimalPlaces))}
    step={new BigNumber(10).pow(-Math.min(decimalPlaces, 8)).toNumber()}
    value={toNumberFieldValue(value)}
  >
    <NumberField.Group
      className={cn(
        'border-border bg-surface w-full flex-row items-center rounded-2xl border px-3',
        isInvalid && 'border-danger',
        classNames?.inputGroup,
      )}
    >
      {prefix ? <View className="shrink-0">{prefix}</View> : null}
      <NumberField.Input
        autoCapitalize="none"
        autoCorrect={false}
        className={cn(
          'text-foreground min-w-0 flex-1 border-0 bg-transparent px-0 py-0 text-right shadow-none',
          classNames?.input,
        )}
        isAutoPaddingActive={false}
        isDisabled={isDisabled}
        keyboardType="decimal-pad"
        onBlur={() => {
          onChange?.(toCommittedAmountValue(value, decimalPlaces));
          onBlur?.();
        }}
        onChangeText={nextValue => onChange?.(normalizeAmountText(nextValue, decimalPlaces))}
        placeholder={placeholder}
        value={value}
      />
      {suffix ? <View className="shrink-0">{suffix}</View> : null}
    </NumberField.Group>
    {footer ? <View className={classNames?.footer}>{footer}</View> : null}
    {classNames?.errorContainer ? (
      <View className={classNames.errorContainer}>
        <FieldError>{error}</FieldError>
      </View>
    ) : (
      <FieldError>{error}</FieldError>
    )}
  </NumberField>
);
