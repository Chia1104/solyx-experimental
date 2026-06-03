import type { ReactNode } from 'react';

import { Typography, cn } from 'heroui-native';
import { NumberValue } from 'heroui-native-pro/number-value';

import { AmountNumberField } from './amount-number-field';

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
    <AmountNumberField
      classNames={{
        errorContainer: cn('h-12 items-center justify-center', classNames?.errorContainer),
        footer: cn('items-center', classNames?.valueContainer),
        input: cn('text-center text-4xl font-normal', classNames?.input),
        inputGroup: cn(
          'min-h-11 max-w-1/2 items-end justify-center self-center border-0 bg-transparent px-0 shadow-none',
          classNames?.group,
        ),
        root: classNames?.root,
      }}
      decimalPlaces={decimals}
      error={error}
      footer={
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
      }
      isInvalid={isInvalid}
      onBlur={onBlur}
      onChange={onChange}
      placeholder={placeholder}
      suffix={
        symbol ? (
          <Typography className={cn('text-foreground pb-2', classNames?.symbol)} type="body-sm">
            {symbol}
          </Typography>
        ) : null
      }
      value={value}
    />
  );
};
