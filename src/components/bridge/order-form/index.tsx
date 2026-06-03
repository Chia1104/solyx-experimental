import { useCallback, useMemo } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import BigNumber from 'bignumber.js';
import dayjs from 'dayjs';
import { Button, Card, FieldError, InputGroup, Label, TextField, Typography } from 'heroui-native';
import { NumberValue } from 'heroui-native-pro/number-value';
import type { ControllerRenderProps } from 'react-hook-form';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { ThemedIcon } from '@/components/ui/themed-icon';
import { useClipboard } from '@/hooks/use-clipboard';
import type { SupportedChainID } from '@/modules/chain/enums/supported-chain.enum';
import { useChainAdapterStore } from '@/modules/chain/stores/chain-adapter';
import type { ChainConfig, ChainCurrency } from '@/modules/chain/stores/chain-adapter/types';
import { ChainType } from '@/modules/chain/stores/chain-adapter/types';
import { toBridgeApiChainId } from '@/modules/chain/utils';
import { getChainConfig, useDefiAccount } from '@/modules/defi/hooks/use-defi-account';
import { useQueryBridgeFixedRateEstimatedFee } from '@/modules/defi/hooks/use-query-bridge-fixed-rate-estimated-fee';
import { useQueryBridgeOrderMeta } from '@/modules/defi/hooks/use-query-bridge-order-meta';
import type {
  BridgeFixedRateEstimatedFee,
  BridgeMetaPairs,
} from '@/modules/defi/pipes/bridges.pipe';

import { ChainSelector } from './chain-selector';
import { TokenAmountField } from './token-amount-field';
import type { OrderFormValues } from './utils';
import { useFormSchema } from './utils';

export type OrderFormSubmitValues = OrderFormValues & {
  estimatedFee: BridgeFixedRateEstimatedFee;
};

interface OrderFormProps {
  defaultValues?: OrderFormValues;
  isSubmitting?: boolean;
  orderPairs: BridgeMetaPairs;
  onSubmit: (values: OrderFormSubmitValues) => void | Promise<void>;
}

interface MetaRowProps {
  amount: string;
  label: string;
  locale: string;
  maximumFractionDigits?: number;
  symbol: string;
}

const MetaRow = ({ amount, label, locale, maximumFractionDigits = 8, symbol }: MetaRowProps) => (
  <View className="flex-row items-center justify-between gap-3">
    <Typography className="text-default-foreground" type="body-sm">
      {label}
    </Typography>
    <View className="shrink flex-row items-center justify-end gap-1">
      <NumberValue
        classNames={{ value: 'text-foreground text-right text-sm' }}
        locale={locale}
        maximumFractionDigits={maximumFractionDigits}
        value={new BigNumber(amount || '0').toNumber()}
      />
      <Typography className="text-foreground text-right" type="body-sm">
        {symbol}
      </Typography>
    </View>
  </View>
);

const getSelectedChainAddress = (
  chainType: ChainType | undefined,
  addresses: ReturnType<typeof useDefiAccount>['addresses'],
) => {
  switch (chainType) {
    case ChainType.EVM:
      return addresses.evm;
    case ChainType.TRON:
      return addresses.tron;
    case ChainType.LIQUID:
      return addresses.liquid;
    default:
      return '';
  }
};

const getCurrencyDecimalPlaces = (currency: ChainConfig['nativeCurrency'] | ChainCurrency) =>
  'decimalPlaces' in currency ? currency.decimalPlaces : 6;

const toTokenAmount = (rawBalance: string | undefined, decimals: number, decimalPlaces: number) => {
  if (!rawBalance) {
    return '0';
  }

  return new BigNumber(rawBalance)
    .dividedBy(new BigNumber(10).pow(decimals))
    .toFixed(decimalPlaces);
};

export const OrderForm = (props: OrderFormProps) => {
  const { i18n, t } = useTranslation(['defi', 'global']);
  const { addresses, liquidSubaccountPointer } = useDefiAccount();
  const getAdapterByChainId = useChainAdapterStore(state => state.getAdapterByChainId);
  const liquidLoggedIn = useChainAdapterStore(state => state.liquidLoggedIn);
  const { pasteFromClipboard } = useClipboard();

  const formSchema = useFormSchema();
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: '',
      fromChainId: '' as SupportedChainID,
      fromToken: '',
      takerAddress: '',
      toChainId: '' as SupportedChainID,
      toToken: '',
      ...props.defaultValues,
    },
    mode: 'onChange',
  });

  const [fromChainId, toChainId, fromToken, toToken, amount] = useWatch({
    control: form.control,
    name: ['fromChainId', 'toChainId', 'fromToken', 'toToken', 'amount'],
  });

  const fromChainOptions = useMemo(() => {
    return props.orderPairs.map(pair => ({
      value: pair.chainId,
      label: pair.chainName,
    }));
  }, [props.orderPairs]);
  const toChainOptions = useMemo(() => {
    return (
      props.orderPairs
        .find(pair => pair.chainId === fromChainId)
        ?.targetChains.map(chain => ({
          value: chain.chainId,
          label: chain.chainName,
        })) ?? []
    );
  }, [fromChainId, props.orderPairs]);

  const fromTokenOptions = useMemo(() => {
    const targetChain = props.orderPairs
      .find(pair => pair.chainId === fromChainId)
      ?.targetChains.find(chain => chain.chainId === toChainId);
    const symbols = [...new Set(targetChain?.tokenPairs.map(pair => pair.from) ?? [])];

    return symbols.map(symbol => ({
      value: symbol,
      label: symbol,
    }));
  }, [fromChainId, props.orderPairs, toChainId]);

  const effectiveFromToken = fromToken || fromTokenOptions[0]?.value || '';

  const toTokenOptions = useMemo(() => {
    const targetChain = props.orderPairs
      .find(pair => pair.chainId === fromChainId)
      ?.targetChains.find(chain => chain.chainId === toChainId);
    const symbols = [
      ...new Set(
        targetChain?.tokenPairs
          .filter(pair => pair.from === effectiveFromToken)
          .map(pair => pair.to) ?? [],
      ),
    ];

    return symbols.map(symbol => ({
      value: symbol,
      label: symbol,
    }));
  }, [effectiveFromToken, fromChainId, props.orderPairs, toChainId]);

  const effectiveToToken = toToken || toTokenOptions[0]?.value || '';

  const fromChainConfig = useMemo(() => {
    const apiChainId = toBridgeApiChainId(fromChainId);
    return getChainConfig(Number(apiChainId));
  }, [fromChainId]);

  const fromChainIdNumber = fromChainConfig?.chainId ?? 0;
  const fromChainAddress = getSelectedChainAddress(fromChainConfig?.chainType, addresses);
  const isLiquidFromChain = fromChainConfig?.chainType === ChainType.LIQUID;

  const fromCurrency = useMemo(() => {
    const currencies = [
      ...(fromChainConfig ? [fromChainConfig.nativeCurrency] : []),
      ...(fromChainConfig?.supportCurrency ?? []),
    ];

    return currencies.find(currency => currency.symbol === effectiveFromToken);
  }, [effectiveFromToken, fromChainConfig]);

  const selectedChainBalancesQuery = useQuery({
    enabled: Boolean(
      fromChainConfig && fromChainAddress && fromCurrency && (!isLiquidFromChain || liquidLoggedIn),
    ),
    queryKey: [
      'defi/bridge/from-assets',
      fromChainIdNumber,
      fromChainAddress,
      isLiquidFromChain ? (liquidSubaccountPointer ?? null) : null,
    ],
    queryFn: () =>
      getAdapterByChainId(fromChainIdNumber).getBalances(
        fromChainAddress,
        fromChainIdNumber,
        isLiquidFromChain ? liquidSubaccountPointer : undefined,
      ),
  });

  const amountDecimalPlaces = fromCurrency ? getCurrencyDecimalPlaces(fromCurrency) : 6;
  const availableBalance = fromCurrency
    ? toTokenAmount(
        selectedChainBalancesQuery.data?.[fromCurrency.address],
        fromCurrency.decimals,
        amountDecimalPlaces,
      )
    : '0';
  const bridgeFieldsFilled =
    !!fromChainId && !!toChainId && !!effectiveFromToken && !!effectiveToToken;

  const { data: orderMeta = null } = useQueryBridgeOrderMeta(
    {
      fromChainId,
      toChainId,
      fromToken: effectiveFromToken,
      toToken: effectiveToToken,
    },
    {
      enabled: bridgeFieldsFilled,
    },
  );

  const amountValidationError = useMemo(() => {
    const amountValue = new BigNumber(amount || '0');

    if (!amount || !amountValue.isFinite() || !amountValue.isGreaterThan(0)) {
      return undefined;
    }

    if (amountValue.isGreaterThan(availableBalance)) {
      return t('defi:bridge.errors.not.enough.balance');
    }

    if (
      orderMeta?.fixedRateMinimumAmount &&
      amountValue.isLessThan(orderMeta.fixedRateMinimumAmount)
    ) {
      return t('defi:bridge.errors.amount.below.minimum', {
        min: orderMeta.fixedRateMinimumAmount,
      });
    }

    if (
      orderMeta?.fixedRateMaximumAmount &&
      amountValue.isGreaterThan(orderMeta.fixedRateMaximumAmount)
    ) {
      return t('defi:bridge.errors.amount.above.maximum', {
        max: orderMeta.fixedRateMaximumAmount,
      });
    }

    return undefined;
  }, [amount, availableBalance, orderMeta, t]);

  const { data: estimatedFee, isFetching } = useQueryBridgeFixedRateEstimatedFee(
    {
      fromChainId,
      toChainId,
      fromToken: effectiveFromToken,
      toToken: effectiveToToken,
      amount: new BigNumber(amount || '0').toString(),
    },
    {
      enabled:
        bridgeFieldsFilled && !!orderMeta && !amountValidationError && form.formState.isValid,
      refetchInterval: query => {
        const rateExpiresAt = query.state.data?.rateExpiresAt;
        const interval = rateExpiresAt ? dayjs(rateExpiresAt).diff(dayjs(), 'milliseconds') : 0;
        return interval > 0 ? interval : false;
      },
    },
  );

  const isRateExpired = useMemo(() => {
    if (!estimatedFee?.rateExpiresAt) {
      return false;
    }

    return dayjs(estimatedFee.rateExpiresAt).isBefore(dayjs());
  }, [estimatedFee?.rateExpiresAt]);

  const handleFromChainChange = useCallback(
    (
      field: ControllerRenderProps<
        Omit<OrderFormValues, 'amount'> & { amount: string | number },
        'fromChainId'
      >,
      value: SupportedChainID,
    ) => {
      field.onChange(value);
      form.setValue('toChainId', '' as SupportedChainID);
      form.setValue('fromToken', '');
      form.setValue('toToken', '');
      form.setValue('amount', '');
      form.setValue('takerAddress', '');
    },
    [form],
  );

  const handleToChainChange = useCallback(
    (
      field: ControllerRenderProps<
        Omit<OrderFormValues, 'amount'> & { amount: string | number },
        'toChainId'
      >,
      value: SupportedChainID,
    ) => {
      field.onChange(value);
      form.setValue('fromToken', '');
      form.setValue('toToken', '');
      form.setValue('amount', '');
      form.setValue('takerAddress', '');
    },
    [form],
  );

  const handleFromTokenChange = useCallback(
    (onChange: (value: string) => void, value: string) => {
      onChange(value);
      form.setValue('toToken', '');
      form.setValue('amount', '');
    },
    [form],
  );

  const handlePasteAddress = useCallback(async () => {
    const text = (await pasteFromClipboard()).trim();

    if (!text) {
      return;
    }

    form.setValue('takerAddress', text, {
      shouldDirty: true,
      shouldValidate: true,
    });
  }, [form, pasteFromClipboard]);

  const handleSetMaxAmount = useCallback(() => {
    const maximumAmount = new BigNumber(availableBalance)
      .decimalPlaces(amountDecimalPlaces, BigNumber.ROUND_DOWN)
      .toString();

    form.setValue('amount', maximumAmount, {
      shouldDirty: true,
      shouldValidate: true,
    });
  }, [amountDecimalPlaces, availableBalance, form]);

  const handleSubmit = form.handleSubmit(async values => {
    if (amountValidationError) {
      form.setError('amount', { message: amountValidationError });
      return;
    }

    if (isFetching || props.isSubmitting || !estimatedFee || isRateExpired) return;

    await props.onSubmit({
      ...values,
      estimatedFee,
      fromToken: effectiveFromToken,
      toToken: effectiveToToken,
    });
  });

  return (
    <View className="gap-5">
      <View className="gap-3">
        <Label>{t('defi:label.network')}</Label>
        <View className="flex-row items-center justify-between gap-2">
          <Controller
            name="fromChainId"
            control={form.control}
            render={({ field, fieldState }) => (
              <ChainSelector
                {...field}
                onChange={value => handleFromChainChange(field, value)}
                options={fromChainOptions}
                placeholder={t('defi:bridge.swapForm.network.placeholder')}
                isInvalid={fieldState.invalid}
                error={fieldState.error?.message}
              />
            )}
          />
          <ThemedIcon name="arrow-forward" size={20} />
          <Controller
            name="toChainId"
            control={form.control}
            render={({ field, fieldState }) => (
              <ChainSelector
                {...field}
                onChange={value => handleToChainChange(field, value)}
                options={toChainOptions}
                placeholder={t('defi:bridge.swapForm.network.placeholder')}
                isDisabled={!fromChainId}
                isInvalid={fieldState.invalid}
                error={fieldState.error?.message}
              />
            )}
          />
        </View>
      </View>

      <Controller
        name="takerAddress"
        control={form.control}
        render={({ field, fieldState }) => (
          <TextField className="w-full gap-2" isInvalid={fieldState.invalid}>
            <Label>{t('bridge.swapForm.takerAddress.label')}</Label>
            <InputGroup className="w-full flex-row items-center">
              <InputGroup.Input
                autoCapitalize="none"
                autoCorrect={false}
                onBlur={field.onBlur}
                onChangeText={field.onChange}
                placeholder={t('defi:bridge.swapForm.takerAddress.placeholder')}
                value={field.value}
                className="w-full"
                numberOfLines={1}
              />
              <InputGroup.Suffix>
                <Button isIconOnly onPress={handlePasteAddress} size="sm" variant="ghost">
                  <ThemedIcon name="clipboard-outline" size={16} />
                </Button>
              </InputGroup.Suffix>
            </InputGroup>
            <FieldError>{fieldState.error?.message}</FieldError>
          </TextField>
        )}
      />

      {fromChainId && toChainId ? (
        <>
          <Controller
            name="amount"
            control={form.control}
            render={({ field, fieldState }) => (
              <TokenAmountField
                amount={String(field.value ?? '')}
                balance={availableBalance}
                decimalPlaces={amountDecimalPlaces}
                error={fieldState.error?.message ?? amountValidationError}
                isDisabled={fromTokenOptions.length === 0}
                isInvalid={fieldState.invalid || !!amountValidationError}
                label={t('defi:bridge.swapForm.from.label')}
                onAmountBlur={field.onBlur}
                onAmountChange={field.onChange}
                onChange={value =>
                  handleFromTokenChange(
                    nextValue =>
                      form.setValue('fromToken', nextValue, {
                        shouldDirty: true,
                        shouldValidate: true,
                      }),
                    value,
                  )
                }
                onMaxPress={handleSetMaxAmount}
                options={fromTokenOptions}
                placeholder={t('defi:title.selectToken')}
                showMaxButton
                value={effectiveFromToken}
              />
            )}
          />

          <TokenAmountField
            amount={estimatedFee?.receivedAmount ?? ''}
            decimalPlaces={8}
            isDisabled={!effectiveFromToken || toTokenOptions.length === 0}
            isReadOnly
            label={t('defi:bridge.swapForm.to.label')}
            onChange={value =>
              form.setValue('toToken', value, {
                shouldDirty: true,
                shouldValidate: true,
              })
            }
            options={toTokenOptions}
            placeholder={t('defi:title.selectToken')}
            value={effectiveToToken}
          />
        </>
      ) : null}

      {orderMeta && effectiveFromToken ? (
        <Card>
          <MetaRow
            amount={orderMeta.fixedRateMaximumAmount ?? orderMeta.maximumAmount}
            label={t('defi:bridge.swapForm.amount.max.amount')}
            locale={i18n.language}
            maximumFractionDigits={amountDecimalPlaces}
            symbol={effectiveFromToken}
          />
          <MetaRow
            amount={orderMeta.fixedRateMinimumAmount ?? orderMeta.minimumAmount}
            label={t('defi:bridge.swapForm.amount.min.amount')}
            locale={i18n.language}
            maximumFractionDigits={amountDecimalPlaces}
            symbol={effectiveFromToken}
          />
          {estimatedFee ? (
            <>
              <MetaRow
                amount={estimatedFee.feeAmount}
                label={t('defi:bridge.feeInfo.platformFee')}
                locale={i18n.language}
                symbol={estimatedFee.feeAmountToken ?? effectiveToToken}
              />
              <MetaRow
                amount={estimatedFee.receivedAmount}
                label={t('defi:bridge.feeInfo.receivedAmount')}
                locale={i18n.language}
                symbol={effectiveToToken}
              />
            </>
          ) : null}
        </Card>
      ) : null}

      <FieldError isInvalid={isRateExpired}>{t('defi:bridge.errors.rate-expired')}</FieldError>

      <Button
        className="self-center px-6"
        isDisabled={
          !form.formState.isValid ||
          !!amountValidationError ||
          !estimatedFee ||
          isFetching ||
          props.isSubmitting ||
          isRateExpired
        }
        onPress={handleSubmit}
        size="sm"
      >
        <Button.Label>{t('global:action.submit')}</Button.Label>
      </Button>
    </View>
  );
};
