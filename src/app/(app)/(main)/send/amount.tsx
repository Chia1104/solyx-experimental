import { useMemo } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import BigNumber from 'bignumber.js';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Button, Typography } from 'heroui-native';
import { NumberValue } from 'heroui-native-pro/number-value';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import * as z from 'zod';

import { TokenMark } from '@/components/home/chain-mark';
import { Page } from '@/components/page';
import { AmountInput } from '@/components/ui/amount-input';
import { KeyboardAwareScrollView } from '@/components/ui/keyboard-aware-scroll-view';
import { useQueryAssets } from '@/modules/defi/hooks/use-query-assets';

interface SendAmountFormValues {
  amount: string;
}

const getMaximumAmount = (balance: string, decimalPlaces: number) => {
  return new BigNumber(balance).decimalPlaces(decimalPlaces, BigNumber.ROUND_DOWN).toString();
};

const getCurrencyDecimalPlaces = (
  currency: ReturnType<typeof useQueryAssets>['assets'][number] | undefined,
) => {
  if (!currency) {
    return 6;
  }

  return 'decimalPlaces' in currency && typeof currency.decimalPlaces === 'number'
    ? currency.decimalPlaces
    : 6;
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

export default function SendAmountScreen() {
  const router = useRouter();
  const { i18n, t } = useTranslation(['defi', 'global']);
  const { to, token, tokenAddress } = useLocalSearchParams<{
    to?: string;
    token?: string;
    tokenAddress?: string;
  }>();
  const selectedTokenAddress = tokenAddress ?? token ?? '';
  const recipientAddress = to ?? '';
  const { assets, rows } = useQueryAssets();

  const assetInfo = useMemo(() => {
    return assets.find(asset => asset.address.toLowerCase() === selectedTokenAddress.toLowerCase());
  }, [assets, selectedTokenAddress]);

  const selectedToken = useMemo(() => {
    return rows.find(row => row.address.toLowerCase() === selectedTokenAddress.toLowerCase());
  }, [rows, selectedTokenAddress]);

  const decimals = assetInfo?.decimals ?? 18;
  const decimalPlaces = getCurrencyDecimalPlaces(assetInfo);
  const balance = selectedToken?.balance ?? '0';
  const price = selectedToken?.price ?? '0';
  const symbol = selectedToken?.symbol ?? assetInfo?.symbol ?? '';

  const formSchema = useMemo(
    () =>
      z.object({
        amount: z
          .string()
          .trim()
          .min(1, t('defi:error.amount.required'))
          .refine(value => toBigNumberOrNull(value)?.isGreaterThan(0) ?? false, {
            message: t('defi:error.amount.greater.than', { value: '0' }),
          })
          .refine(value => toBigNumberOrNull(value)?.isLessThanOrEqualTo(balance) ?? false, {
            message: t('defi:error.amount.insufficient.balance'),
          }),
      }),
    [balance, t],
  );

  const form = useForm<SendAmountFormValues>({
    defaultValues: {
      amount: '',
    },
    mode: 'onChange',
    resolver: zodResolver(formSchema),
  });

  const amount = form.watch('amount');
  const fiatAmount = useMemo(() => {
    return new BigNumber(amount || '0').multipliedBy(price).toNumber();
  }, [amount, price]);

  const handleSetMax = () => {
    const maximumAmount = getMaximumAmount(balance, decimalPlaces);

    if (!new BigNumber(maximumAmount).isGreaterThan(0)) {
      form.setError('amount', {
        message: t('defi:error.amount.insufficient.balance'),
      });
      return;
    }

    form.setValue('amount', maximumAmount, {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  const handleSubmit = form.handleSubmit(values => {
    router.push({
      pathname: '/send/confirm',
      params: {
        method: 'transfer(address,uint256)',
        to: recipientAddress,
        token: selectedTokenAddress,
        tokenAddress: selectedTokenAddress,
        value: values.amount,
      },
    });
  });

  return (
    <Page className="bg-background">
      <KeyboardAwareScrollView contentContainerClassName="gap-6 px-6 pt-6 pb-8">
        <View className="items-center">
          <Controller
            control={form.control}
            name="amount"
            render={({ field, fieldState }) => (
              <AmountInput
                decimals={decimals}
                error={fieldState.error?.message}
                fiatAmount={fiatAmount}
                isInvalid={fieldState.invalid}
                locale={i18n.language}
                onBlur={field.onBlur}
                onChange={field.onChange}
                symbol={symbol}
                value={field.value}
              />
            )}
          />
        </View>

        <View className="border-border flex-row items-center justify-between rounded-lg border bg-transparent px-4 py-3">
          <View className="min-w-0 flex-1 flex-row items-center gap-3">
            {symbol ? <TokenMark symbol={symbol} size="lg" /> : null}
            <View className="min-w-0 flex-1">
              <Typography className="text-default-foreground" type="body-xs">
                {t('defi:label.sendAmount.balance')}
              </Typography>
              <View className="flex-row items-baseline gap-1">
                <NumberValue
                  classNames={{ value: 'text-foreground text-base font-bold' }}
                  locale={i18n.language}
                  maximumFractionDigits={8}
                  value={Number(balance)}
                />
              </View>
              <NumberValue
                classNames={{ value: 'text-default-foreground text-xs' }}
                currency="USD"
                locale={i18n.language}
                maximumFractionDigits={2}
                numberStyle="currency"
                value={selectedToken?.fiatValue.toNumber() ?? 0}
              />
            </View>
          </View>
          <Button onPress={handleSetMax} size="sm" variant="ghost">
            <Button.Label className="text-accent">{t('defi:status.max')}</Button.Label>
          </Button>
        </View>

        <Button
          className="self-center px-6"
          isDisabled={!form.formState.isValid || !recipientAddress || !selectedTokenAddress}
          onPress={handleSubmit}
          size="sm"
        >
          <Button.Label className="text-accent-foreground font-bold">
            {t('global:action.next')}
          </Button.Label>
        </Button>
      </KeyboardAwareScrollView>
    </Page>
  );
}
