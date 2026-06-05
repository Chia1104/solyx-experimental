import { useMemo } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { useDebouncedValue } from '@tanstack/react-pacer';
import BigNumber from 'bignumber.js';
import dayjs from 'dayjs';
import {
  Alert,
  Button,
  Card,
  FieldError,
  InputGroup,
  Label,
  TextField,
  Typography,
} from 'heroui-native';
import { NumberValue } from 'heroui-native-pro/number-value';
import { Controller, FormProvider, useForm, useFormContext, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import Animated, { FadeInDown, FadeOutUp } from 'react-native-reanimated';

import { ThemedIcon } from '@/components/ui/themed-icon';
import { useClipboard } from '@/hooks/use-clipboard';
import type { SupportedChainID } from '@/modules/chain/enums/supported-chain.enum';
import { useLiquidReceiveAddress } from '@/modules/chain/hooks/use-liquid-receive-address';
import { useLiquidSession } from '@/modules/chain/hooks/use-liquid-session';
import { ChainType } from '@/modules/chain/stores/chain-adapter/types';
import { fromBridgeApiChainId, toBridgeApiChainId } from '@/modules/chain/utils';
import { getChainConfig, useDefiAccount } from '@/modules/defi/hooks/use-defi-account';
import { useQueryBridgeFixedRateEstimatedFee } from '@/modules/defi/hooks/use-query-bridge-fixed-rate-estimated-fee';
import { useQueryBridgeFromTokenBalance } from '@/modules/defi/hooks/use-query-bridge-from-token-balance';
import { useQueryBridgeOrderMeta } from '@/modules/defi/hooks/use-query-bridge-order-meta';
import type {
  BridgeFixedRateEstimatedFee,
  BridgeMetaPairs,
} from '@/modules/defi/pipes/bridges.pipe';

import { ChainSelector } from './chain-selector';
import { TokenAmountField } from './token-amount-field';
import { useCountDown } from './use-count-down';
import type { OrderFormValues } from './utils';
import { useFormSchema } from './utils';

const ESTIMATED_FEE_AMOUNT_DEBOUNCE_MS = 800;

export type OrderFormSubmitValues = OrderFormValues & {
  estimatedFee: BridgeFixedRateEstimatedFee;
  refundAddress: string;
  fromAddress?: string;
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

interface ChainOption {
  label: string;
  value: SupportedChainID;
}

interface TokenOption {
  label: string;
  value: string;
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

const getWalletAddressByChainType = (
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

interface NetworkFieldsProps {
  fromChainId: SupportedChainID;
  fromChainOptions: ChainOption[];
  isFetching: boolean;
  toChainOptions: ChainOption[];
}

const NetworkFields = ({
  fromChainId,
  fromChainOptions,
  isFetching,
  toChainOptions,
}: NetworkFieldsProps) => {
  const { t } = useTranslation(['defi']);
  const { ensureLiquidSession } = useLiquidSession();
  const { control, setValue } = useFormContext<OrderFormValues>();

  const handleFromChainChange = (value: SupportedChainID) => {
    const appChainId = fromBridgeApiChainId(value);
    const nextChain = getChainConfig(Number(appChainId));
    if (nextChain?.chainType === ChainType.LIQUID) {
      ensureLiquidSession(nextChain.chainId);
    }

    setValue('toChainId', '' as SupportedChainID);
    setValue('fromToken', '');
    setValue('toToken', '');
    setValue('amount', '');
    setValue('takerAddress', '');
  };

  const handleToChainChange = () => {
    setValue('fromToken', '');
    setValue('toToken', '');
    setValue('amount', '');
    setValue('takerAddress', '');
  };

  return (
    <Animated.View className="gap-3" entering={FadeInDown.duration(300)}>
      <Label>{t('defi:label.network')}</Label>
      <View className="flex-row items-center justify-between gap-2">
        <Controller
          name="fromChainId"
          control={control}
          render={({ field, fieldState }) => (
            <ChainSelector
              {...field}
              onChange={value => {
                field.onChange(value);
                handleFromChainChange(value);
              }}
              options={fromChainOptions}
              placeholder={t('defi:bridge.swapForm.network.placeholder')}
              isDisabled={isFetching}
              isInvalid={fieldState.invalid}
              error={fieldState.error?.message}
            />
          )}
        />
        <ThemedIcon name="arrow-forward" size={20} />
        <Controller
          name="toChainId"
          control={control}
          render={({ field, fieldState }) => (
            <ChainSelector
              {...field}
              onChange={value => {
                field.onChange(value);
                handleToChainChange();
              }}
              options={toChainOptions}
              placeholder={t('defi:bridge.swapForm.network.placeholder')}
              isDisabled={!fromChainId || isFetching}
              isInvalid={fieldState.invalid}
              error={fieldState.error?.message}
            />
          )}
        />
      </View>
    </Animated.View>
  );
};

interface ReceivingAddressFieldProps {
  isFetching: boolean;
  isVisible: boolean;
}

const ReceivingAddressField = ({ isFetching, isVisible }: ReceivingAddressFieldProps) => {
  const { t } = useTranslation(['defi']);
  const { pasteFromClipboard } = useClipboard();
  const { control, setValue } = useFormContext<OrderFormValues>();

  const handlePasteAddress = async () => {
    const text = (await pasteFromClipboard()).trim();

    if (!text) {
      return;
    }

    setValue('takerAddress', text, {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  if (!isVisible) {
    return null;
  }

  return (
    <Animated.View entering={FadeInDown.duration(300).delay(100)} exiting={FadeOutUp.duration(200)}>
      <Controller
        name="takerAddress"
        control={control}
        render={({ field, fieldState }) => (
          <TextField
            className="w-full gap-2"
            isDisabled={isFetching}
            isInvalid={fieldState.invalid}
          >
            <Label>{t('bridge.swapForm.takerAddress.label')}</Label>
            <InputGroup className="w-full flex-row items-center">
              <InputGroup.Input
                autoCapitalize="none"
                autoCorrect={false}
                onBlur={field.onBlur}
                onChangeText={field.onChange}
                placeholder={t('defi:bridge.swapForm.takerAddress.placeholder')}
                value={field.value}
                className="bg-surface w-full"
                numberOfLines={1}
              />
              <InputGroup.Suffix>
                <Button
                  isDisabled={isFetching}
                  isIconOnly
                  onPress={handlePasteAddress}
                  size="sm"
                  variant="ghost"
                >
                  <ThemedIcon name="clipboard-outline" size={16} />
                </Button>
              </InputGroup.Suffix>
            </InputGroup>
            <FieldError>{fieldState.error?.message}</FieldError>
          </TextField>
        )}
      />
    </Animated.View>
  );
};

interface FromAmountFieldProps {
  amountDecimalPlaces: number;
  amountValidationError?: string;
  availableBalance: string;
  effectiveFromToken: string;
  fromTokenOptions: TokenOption[];
  isFetching: boolean;
  isVisible: boolean;
}

const FromAmountField = ({
  amountDecimalPlaces,
  amountValidationError,
  availableBalance,
  effectiveFromToken,
  fromTokenOptions,
  isFetching,
  isVisible,
}: FromAmountFieldProps) => {
  const { t } = useTranslation(['defi']);
  const { control, setValue } = useFormContext<OrderFormValues>();

  const handleTokenChange = (value: string) => {
    setValue('fromToken', value, {
      shouldDirty: true,
      shouldValidate: true,
    });
    setValue('toToken', '');
    setValue('amount', '');
  };

  const handleSetMaxAmount = () => {
    const maximumAmount = new BigNumber(availableBalance)
      .decimalPlaces(amountDecimalPlaces, BigNumber.ROUND_DOWN)
      .toString();

    setValue('amount', maximumAmount, {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  if (!isVisible) {
    return null;
  }

  return (
    <Animated.View entering={FadeInDown.duration(300).delay(200)} exiting={FadeOutUp.duration(200)}>
      <Controller
        name="amount"
        control={control}
        render={({ field, fieldState }) => (
          <TokenAmountField
            amount={String(field.value ?? '')}
            balance={availableBalance}
            decimalPlaces={amountDecimalPlaces}
            error={fieldState.error?.message ?? amountValidationError}
            isDisabled={fromTokenOptions.length === 0 || isFetching}
            isInvalid={fieldState.invalid || !!amountValidationError}
            label={t('defi:bridge.swapForm.from.label')}
            onAmountBlur={field.onBlur}
            onAmountChange={field.onChange}
            onChange={handleTokenChange}
            onMaxPress={handleSetMaxAmount}
            options={fromTokenOptions}
            placeholder={t('defi:title.selectToken')}
            showMaxButton
            value={effectiveFromToken}
          />
        )}
      />
    </Animated.View>
  );
};

interface ToAmountFieldProps {
  effectiveFromToken: string;
  effectiveToToken: string;
  isFetching: boolean;
  isVisible: boolean;
  receivedAmount: string;
  toTokenOptions: TokenOption[];
}

const ToAmountField = ({
  effectiveFromToken,
  effectiveToToken,
  isFetching,
  isVisible,
  receivedAmount,
  toTokenOptions,
}: ToAmountFieldProps) => {
  const { t } = useTranslation(['defi']);
  const { setValue } = useFormContext<OrderFormValues>();

  const handleTokenChange = (value: string) => {
    setValue('toToken', value, {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  if (!isVisible) {
    return null;
  }

  return (
    <Animated.View entering={FadeInDown.duration(300).delay(300)} exiting={FadeOutUp.duration(200)}>
      <TokenAmountField
        amount={receivedAmount}
        decimalPlaces={8}
        isDisabled={!effectiveFromToken || toTokenOptions.length === 0 || isFetching}
        isReadOnly
        label={t('defi:bridge.swapForm.to.label')}
        onChange={handleTokenChange}
        options={toTokenOptions}
        placeholder={t('defi:title.selectToken')}
        value={effectiveToToken}
      />
    </Animated.View>
  );
};

export const OrderForm = (props: OrderFormProps) => {
  const { i18n, t } = useTranslation(['defi', 'global']);
  const { addresses, currentChainId, liquidAmpId, liquidSubaccountPointer } = useDefiAccount();
  const defaultFromChainId = fromBridgeApiChainId(String(currentChainId) as SupportedChainID);

  const formSchema = useFormSchema();
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: '',
      fromChainId: defaultFromChainId,
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

  const {
    balance: availableBalance,
    chain: fromChain,
    decimalPlaces: amountDecimalPlaces,
  } = useQueryBridgeFromTokenBalance({
    fromChainId,
    fromToken: effectiveFromToken,
  });
  const fromChainType = useMemo(() => {
    if (!fromChainId) return fromChain?.chainType;
    const numericId = Number(toBridgeApiChainId(fromChainId as SupportedChainID));
    if (isNaN(numericId)) return fromChain?.chainType;
    return getChainConfig(numericId)?.chainType ?? fromChain?.chainType;
  }, [fromChainId, fromChain?.chainType]);

  const isLiquidFromChain = fromChainType === ChainType.LIQUID;
  const fromChainWalletAddress = getWalletAddressByChainType(fromChainType, addresses);
  const liquidRefundAddressQuery = useLiquidReceiveAddress(
    {
      ampId: liquidAmpId,
      subaccount: liquidSubaccountPointer ?? 0,
    },
    {
      enabled: isLiquidFromChain && Boolean(liquidAmpId),
    },
  );
  const fromAddress = isLiquidFromChain ? undefined : fromChainWalletAddress;
  const refundAddress = isLiquidFromChain
    ? (liquidRefundAddressQuery.data?.confidential ?? '')
    : fromChainWalletAddress;

  const bridgeFieldsFilled =
    !!fromChainId && !!toChainId && !!effectiveFromToken && !!effectiveToToken;

  const { data: orderMeta = null, isError: isOrderMetaError } = useQueryBridgeOrderMeta(
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

  const [debouncedAmount] = useDebouncedValue(amount, {
    wait: ESTIMATED_FEE_AMOUNT_DEBOUNCE_MS,
  });

  const { data: estimatedFee, isFetching } = useQueryBridgeFixedRateEstimatedFee(
    {
      fromChainId,
      toChainId,
      fromToken: effectiveFromToken,
      toToken: effectiveToToken,
      amount: new BigNumber(debouncedAmount || '0').toString(),
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
  const isEstimatedFeeAmountSettled = debouncedAmount === amount;
  const canUseEstimatedFee =
    isEstimatedFeeAmountSettled &&
    bridgeFieldsFilled &&
    !!orderMeta &&
    !amountValidationError &&
    form.formState.isValid;
  const currentEstimatedFee = canUseEstimatedFee ? estimatedFee : undefined;
  const { isExpired: isRateExpired, remainingSeconds } = useCountDown(
    currentEstimatedFee?.rateExpiresAt,
  );
  const isSubmitDisabled = isFetching || props.isSubmitting || isRateExpired;

  const handleSubmit = form.handleSubmit(async values => {
    if (amountValidationError) {
      form.setError('amount', { message: amountValidationError });
      return;
    }

    if (isFetching || props.isSubmitting || !currentEstimatedFee || isRateExpired || !refundAddress)
      return;

    await props.onSubmit({
      ...values,
      estimatedFee: currentEstimatedFee,
      fromToken: effectiveFromToken,
      toToken: effectiveToToken,
      fromAddress,
      refundAddress,
    });
  });

  return (
    <FormProvider {...form}>
      <View className="gap-5">
        <NetworkFields
          fromChainId={fromChainId}
          fromChainOptions={fromChainOptions}
          isFetching={isFetching}
          toChainOptions={toChainOptions}
        />

        <ReceivingAddressField isFetching={isFetching} isVisible={!!toChainId} />

        <FromAmountField
          amountDecimalPlaces={amountDecimalPlaces}
          amountValidationError={amountValidationError}
          availableBalance={availableBalance}
          effectiveFromToken={effectiveFromToken}
          fromTokenOptions={fromTokenOptions}
          isFetching={isFetching}
          isVisible={!!fromChainId && !!toChainId}
        />

        <ToAmountField
          effectiveFromToken={effectiveFromToken}
          effectiveToToken={effectiveToToken}
          isFetching={isFetching}
          isVisible={!!fromChainId && !!toChainId}
          receivedAmount={currentEstimatedFee?.receivedAmount ?? ''}
          toTokenOptions={toTokenOptions}
        />

        {isOrderMetaError ? (
          <Animated.View
            entering={FadeInDown.duration(300).delay(400)}
            exiting={FadeOutUp.duration(200)}
          >
            <Alert status="danger">
              <Alert.Indicator />
              <Alert.Content>
                <Alert.Description>
                  {t('defi:bridge.errors.get-bridge-order-meta.error')}
                </Alert.Description>
              </Alert.Content>
            </Alert>
          </Animated.View>
        ) : null}

        {orderMeta && effectiveFromToken ? (
          <Animated.View
            className="gap-4"
            entering={FadeInDown.duration(300).delay(400)}
            exiting={FadeOutUp.duration(200)}
          >
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
              {currentEstimatedFee ? (
                <>
                  <MetaRow
                    amount={currentEstimatedFee.feeAmount}
                    label={t('defi:bridge.feeInfo.platformFee')}
                    locale={i18n.language}
                    symbol={currentEstimatedFee.feeAmountToken ?? effectiveToToken}
                  />
                  <MetaRow
                    amount={currentEstimatedFee.receivedAmount}
                    label={t('defi:bridge.feeInfo.receivedAmount')}
                    locale={i18n.language}
                    symbol={effectiveToToken}
                  />
                </>
              ) : null}
            </Card>

            <Alert status="warning">
              <Alert.Indicator />
              <Alert.Content>
                <Alert.Description>{t('defi:buyModal.warningText')}</Alert.Description>
              </Alert.Content>
            </Alert>
          </Animated.View>
        ) : null}

        {toChainId ? (
          <>
            <FieldError isInvalid={isRateExpired}>
              {t('defi:bridge.errors.rate-expired')}
            </FieldError>

            <Button
              className="self-center px-6"
              isDisabled={isSubmitDisabled}
              onPress={handleSubmit}
              size="sm"
            >
              <Button.Label>
                {t('global:action.submit')}
                {remainingSeconds > 0 ? ` (${remainingSeconds})` : ''}
              </Button.Label>
            </Button>
          </>
        ) : null}
      </View>
    </FormProvider>
  );
};
