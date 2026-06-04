import { useCallback, useMemo } from 'react';

import { Button, cn, FieldError, Label, Select, Typography } from 'heroui-native';
import { NumberValue } from 'heroui-native-pro/number-value';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { TokenMark } from '@/components/home/chain-mark';
import { AmountNumberField } from '@/components/ui/amount-number-field';
import type { SupportedCurrencySymbol } from '@/modules/chain/enums/supported-currency-symbol.enum';

export interface TokenOption {
  label: string;
  value: string;
}

interface TokenSelectorProps {
  error?: string;
  isDisabled?: boolean;
  isInvalid?: boolean;
  label?: string;
  onChange: (token: string) => void;
  options: TokenOption[];
  placeholder: string;
  value: string;
}

export interface TokenAmountFieldProps extends TokenSelectorProps {
  amount: string;
  balance?: string;
  decimalPlaces?: number;
  isReadOnly?: boolean;
  onAmountBlur?: () => void;
  onAmountChange?: (amount: string) => void;
  onMaxPress?: () => void;
  showMaxButton?: boolean;
}

const toNumberValue = (value: string) => {
  if (!value.trim()) {
    return Number.NaN;
  }

  try {
    const amount = Number(value);
    return Number.isFinite(amount) ? amount : Number.NaN;
  } catch {
    return Number.NaN;
  }
};

const TokenSelector = (props: TokenSelectorProps) => {
  const value = useMemo(() => {
    return props.options.find(option => option.value === props.value);
  }, [props.options, props.value]);

  const handleValueChange = useCallback(
    (option?: TokenOption) => {
      if (!option) return;
      props.onChange(option.value);
    },
    [props],
  );

  return (
    <View className="gap-1">
      {props.label ? <Label>{props.label}</Label> : null}
      <Select
        isDisabled={props.isDisabled}
        presentation="bottom-sheet"
        value={value}
        onValueChange={handleValueChange}
      >
        <Select.Trigger className="min-w-28 p-0 shadow-none">
          {value ? (
            <View className="min-w-0 flex-1 flex-row items-center gap-2">
              <TokenMark
                network=""
                size="lg"
                symbol={value.value as SupportedCurrencySymbol}
                type="token"
              />
              <Typography className="text-foreground min-w-0 flex-1" numberOfLines={1}>
                {value.label}
              </Typography>
            </View>
          ) : (
            <Select.Value placeholder={props.placeholder} />
          )}
          <Select.TriggerIndicator />
        </Select.Trigger>
        <Select.Portal>
          <Select.Overlay className="bg-backdrop/50" />
          <Select.Content presentation="bottom-sheet">
            {props.options.map(option => (
              <Select.Item key={option.value} value={option.value} label={option.label}>
                <View className="flex-1 flex-row items-center gap-3">
                  <TokenMark
                    network=""
                    size="lg"
                    symbol={option.value as SupportedCurrencySymbol}
                    type="token"
                  />
                  <Select.ItemLabel />
                </View>
                <Select.ItemIndicator />
              </Select.Item>
            ))}
          </Select.Content>
        </Select.Portal>
      </Select>
      <FieldError isInvalid={props.isInvalid}>{props.error}</FieldError>
    </View>
  );
};

export const TokenAmountField = ({
  amount,
  balance,
  decimalPlaces = 8,
  error,
  isReadOnly = false,
  isInvalid,
  onAmountBlur,
  onAmountChange,
  onMaxPress,
  showMaxButton = false,
  ...props
}: TokenAmountFieldProps) => {
  const { i18n, t } = useTranslation(['defi']);
  const isDisabled = props.isDisabled || isReadOnly;

  return (
    <View className="gap-2">
      <View className="flex-row items-center justify-between gap-3">
        <Label>{props.label}</Label>
        {balance !== undefined ? (
          <View className="flex-row items-center gap-1">
            <Typography className="text-default-foreground" type="body-xs">
              {t('defi:bridge.swapForm.amount.info', { value: '' })}
            </Typography>
            <NumberValue
              classNames={{ value: 'text-default-foreground text-xs' }}
              locale={i18n.language}
              maximumFractionDigits={decimalPlaces}
              value={toNumberValue(balance)}
            />
          </View>
        ) : null}
      </View>

      <AmountNumberField
        classNames={{
          input: 'text-xl',
          inputGroup: cn('border-[1.5px] shadow', showMaxButton ? 'pr-0' : ''),
        }}
        decimalPlaces={decimalPlaces}
        error={error}
        isDisabled={isDisabled}
        isInvalid={isInvalid}
        onBlur={onAmountBlur}
        onChange={onAmountChange}
        prefix={<TokenSelector {...props} label="" />}
        suffix={
          showMaxButton ? (
            <Button isDisabled={isDisabled} variant="ghost" onPress={onMaxPress} size="sm">
              <Button.Label>{t('defi:status.max')}</Button.Label>
            </Button>
          ) : null
        }
        value={amount}
      />
    </View>
  );
};
