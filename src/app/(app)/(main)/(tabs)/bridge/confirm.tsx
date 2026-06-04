import { useMemo, useRef } from 'react';

import { useLocalSearchParams, useRouter } from 'expo-router';
import { Alert, Select, Typography, useToast } from 'heroui-native';
import { NumberValue } from 'heroui-native-pro/number-value';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { TokenWithChain } from '@/components/bridge/token-with-chain';
import { GasSettingSheet } from '@/components/defi/transaction-confirm/gas-setting-sheet';
import {
  GasFeeCard,
  TransactionActions,
  TransactionWarning,
} from '@/components/defi/transaction-confirm/shared-ui';
import { useTransactionConfirm } from '@/components/defi/transaction-confirm/use-transaction-confirm';
import { Page } from '@/components/page';
import { AddressDisplay } from '@/components/ui/address-display';
import { CopyAction } from '@/components/ui/copy-action';
import { KeyboardAwareScrollView } from '@/components/ui/keyboard-aware-scroll-view';
import { ChainType } from '@/modules/chain/stores/chain-adapter/types';
import type { TransactionConfirmParams } from '@/modules/chain/utils/transaction-confirm';
import { useDefiAccount } from '@/modules/defi/hooks/use-defi-account';
import { useMutationUpdateBridgePaymentTxHash } from '@/modules/defi/hooks/use-mutation-update-bridge-payment-tx-hash';

export default function BridgeConfirmScreen() {
  const { i18n, t } = useTranslation(['defi', 'global']);
  const { toast } = useToast();
  const router = useRouter();
  const { chain, chainType, currentAddress, wallet } = useDefiAccount();
  const accountName = wallet?.name ?? t('defi:label.setting.current.account');

  const params = useLocalSearchParams<{
    orderId?: string;
    bridgeOrderId?: string;
    paymentTargetAddress?: string;
    amount?: string;
    receivedAmount?: string;
    platformFee?: string;
    feeAmountToken?: string;
    expiresAt?: string;
    fromChainId?: string;
    toChainId?: string;
    fromToken?: string;
    toToken?: string;
    toAddress?: string;
  }>();

  const {
    orderId,
    paymentTargetAddress,
    amount,
    receivedAmount,
    platformFee,
    feeAmountToken,
    expiresAt,
    fromChainId,
    toChainId,
    fromToken,
    toToken,
    toAddress,
  } = params;

  const isParamsValid = !!orderId && !!paymentTargetAddress && !!amount;

  const isOrderExpired = useMemo(
    () => !!expiresAt && new Date(expiresAt) <= new Date(),
    [expiresAt],
  );

  const updatePaymentTxHash = useMutationUpdateBridgePaymentTxHash({
    onError: () => {
      toast.show({ variant: 'warning', description: t('defi:error.unknown.error') });
    },
  });

  const sendParams = useMemo<TransactionConfirmParams>(
    () => ({
      to: paymentTargetAddress ?? '',
      value: amount ?? '0',
      tokenAddress: fromToken,
      suppressSuccessModal: true,
    }),
    [paymentTargetAddress, amount, fromToken],
  );

  const activeChainType = chainType ?? ChainType.EVM;

  const gasFeeRef = useRef<string>('0');

  const handleSuccess = async (txHash: string) => {
    if (!orderId) return;
    await updatePaymentTxHash.mutateAsync({
      id: orderId,
      txHash,
      gasFee: gasFeeRef.current,
    });
    router.replace('/bridge');
  };

  const {
    gasFee,
    fiatAmount,
    nativeCurrencyToken,
    evmGasMode,
    setEvmGasMode,
    evmGasSettings,
    isEvmGasReady,
    isGasSheetOpen,
    setIsGasSheetOpen,
    evmGasModeLabel,
    isSending,
    isConfirmDisabled,
    isMaximum,
    hasTransactionWarning,
    onSendTransaction,
    handleCancel,
  } = useTransactionConfirm({
    chainType: activeChainType,
    sendParams,
    onCancel: router.back,
    onDismissAfterSuccess: () => router.replace('/bridge'),
    onGoToActivity: () => router.replace('/activity'),
    onSuccess: handleSuccess,
  });

  gasFeeRef.current = gasFee;

  if (!isParamsValid) {
    return (
      <Page.Stack>
        <View className="flex-1 items-center justify-center px-6">
          <Typography className="text-danger text-center" type="body-sm">
            {t('defi:bridge.confirmOrder.invalid.params')}
          </Typography>
        </View>
      </Page.Stack>
    );
  }

  return (
    <Page.Stack>
      <KeyboardAwareScrollView contentContainerClassName="gap-6 px-6 pt-6 pb-8">
        {/* From / To
              Layout: [connector (left)] | [icon + amount rows (right)]
              The connector spans the full height on the left side. */}
        <View className="flex-row gap-3">
          {/* Connector column — narrow, full-height, dashes fill the space */}
          <View className="items-center" style={{ width: 12 }}>
            <View className="flex-1 items-center justify-center gap-1 py-3">
              {Array.from({ length: 9 }).map((_, i) => (
                <View key={i} className="bg-foreground/20" style={{ width: 1, height: 4 }} />
              ))}
              <Typography className="text-foreground/30 leading-none" style={{ fontSize: 20 }}>
                ↓
              </Typography>
            </View>
          </View>

          {/* Icon + amount rows */}
          <View className="flex-1 gap-6">
            {/* From row */}
            <View className="flex-row items-center gap-3">
              <TokenWithChain chainId={fromChainId} token={fromToken} />
              <View className="flex-1">
                <NumberValue
                  classNames={{
                    container: 'flex-row items-baseline gap-1.5',
                    value: 'text-foreground text-3xl font-semibold',
                  }}
                  locale={i18n.language}
                  maximumFractionDigits={8}
                  value={-Number(amount ?? '0')}
                >
                  <NumberValue.Value />
                  <NumberValue.Suffix className="text-foreground/70 text-base font-medium">
                    {fromToken}
                  </NumberValue.Suffix>
                </NumberValue>
                {fiatAmount > 0 && (
                  <NumberValue
                    classNames={{ value: 'text-foreground/50 text-sm' }}
                    currency="USD"
                    locale={i18n.language}
                    maximumFractionDigits={2}
                    numberStyle="currency"
                    value={fiatAmount}
                  />
                )}
              </View>
            </View>

            {/* To row */}
            <View className="flex-row items-center gap-3">
              <TokenWithChain chainId={toChainId} token={toToken} />
              <View className="flex-1">
                <View className="flex-row items-baseline gap-0.5">
                  <Typography className="text-foreground text-xl font-semibold">+</Typography>
                  <NumberValue
                    classNames={{
                      container: 'flex-row items-baseline gap-1.5',
                      value: 'text-foreground text-xl font-semibold',
                    }}
                    locale={i18n.language}
                    maximumFractionDigits={8}
                    value={Number(receivedAmount ?? '0')}
                  >
                    <NumberValue.Value />
                    <NumberValue.Suffix className="text-foreground/70 text-sm font-medium">
                      {toToken}
                    </NumberValue.Suffix>
                  </NumberValue>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Bridge order info */}
        <View className="gap-3">
          <Typography className="text-foreground font-semibold" type="body">
            {t('defi:bridge.confirmOrder.bridge.order')}
          </Typography>

          <View className="gap-3">
            <View className="flex-row items-center justify-between gap-3">
              <Typography className="text-foreground/60 shrink-0" type="body-sm">
                {t('defi:bridge.confirmOrder.from')}
              </Typography>
              <View className="flex-row flex-wrap items-center justify-end gap-0.5">
                <Typography className="text-foreground text-right" type="body-sm">
                  {accountName} (
                </Typography>
                <AddressDisplay address={currentAddress} type="body-sm" variant="compact" />
                <Typography className="text-foreground" type="body-sm">
                  )
                </Typography>
              </View>
            </View>

            {!!platformFee && (
              <View className="flex-row items-center justify-between gap-3">
                <Typography className="text-foreground/60 shrink-0" type="body-sm">
                  {t('defi:bridge.confirmOrder.platform.fee')}
                </Typography>
                <NumberValue
                  classNames={{
                    container: 'flex-row items-baseline gap-1',
                    value: 'text-foreground text-sm text-right',
                  }}
                  locale={i18n.language}
                  maximumFractionDigits={8}
                  value={Number(platformFee ?? '0')}
                >
                  <NumberValue.Value />
                  {!!feeAmountToken && (
                    <NumberValue.Suffix className="text-foreground/70 text-xs">
                      {feeAmountToken}
                    </NumberValue.Suffix>
                  )}
                </NumberValue>
              </View>
            )}

            {!!expiresAt && (
              <View className="flex-row items-center justify-between gap-3">
                <Typography className="text-foreground/60 shrink-0" type="body-sm">
                  {t('defi:bridge.confirmOrder.expired')}
                </Typography>
                <Typography
                  className={isOrderExpired ? 'text-danger font-medium' : 'text-foreground/70'}
                  type="body-sm"
                >
                  {new Date(expiresAt).toLocaleTimeString()}
                </Typography>
              </View>
            )}

            <Select presentation="bottom-sheet">
              <Select.Trigger variant="unstyled">
                <View className="flex-row items-center gap-1">
                  <Typography className="text-foreground/60" type="body-sm">
                    {t('defi:bridge.confirmOrder.more')}
                  </Typography>
                  <Select.TriggerIndicator />
                </View>
              </Select.Trigger>
              <Select.Portal>
                <Select.Overlay className="bg-backdrop/50" />
                <Select.Content
                  contentContainerClassName="px-4 pb-8"
                  presentation="bottom-sheet"
                  snapPoints={['30%']}
                >
                  <Select.ListLabel className="pt-1 pb-3">
                    {t('defi:bridge.confirmOrder.bridge.route')}
                  </Select.ListLabel>
                  <Select.Item label="Echox" value="echox" />
                </Select.Content>
              </Select.Portal>
            </Select>
          </View>
        </View>

        {/* To section — recipient + gas fee */}
        <View className="gap-3">
          <Typography className="text-foreground font-semibold" type="body">
            {t('defi:bridge.confirmOrder.to')}
          </Typography>

          <View className="gap-3">
            {!!toAddress && (
              <View className="flex-row items-start justify-between gap-3">
                <Typography className="text-foreground/60 shrink-0" type="body-sm">
                  {t('defi:bridge.confirmOrder.address')}
                </Typography>
                <View className="max-w-[65%] flex-row items-center gap-1">
                  <AddressDisplay
                    address={toAddress}
                    className="shrink text-right"
                    type="body-sm"
                    variant="compact"
                  />
                  <CopyAction value={toAddress} />
                </View>
              </View>
            )}

            {chain && (
              <GasFeeCard
                gasFee={gasFee}
                gasModeLabel={evmGasModeLabel}
                isMaximum={isMaximum}
                isPressable={activeChainType === ChainType.EVM && isEvmGasReady}
                locale={i18n.language}
                nativeCurrency={chain.nativeCurrency}
                nativeCurrencyToken={nativeCurrencyToken}
                onPress={
                  activeChainType === ChainType.EVM && isEvmGasReady
                    ? () => setIsGasSheetOpen(true)
                    : undefined
                }
              />
            )}
          </View>
        </View>

        {chain && activeChainType === ChainType.EVM && (
          <GasSettingSheet
            gasSettings={evmGasSettings}
            isOpen={isGasSheetOpen}
            locale={i18n.language}
            nativePrice={nativeCurrencyToken?.price}
            nativeSymbol={chain.nativeCurrency.symbol}
            onOpenChange={setIsGasSheetOpen}
            onSelect={setEvmGasMode}
            selectedMode={evmGasMode}
          />
        )}

        {hasTransactionWarning && <TransactionWarning />}

        <TransactionActions
          disabled={isConfirmDisabled || isOrderExpired}
          isSending={isSending}
          onCancel={handleCancel}
          onConfirm={onSendTransaction}
        />

        {isOrderExpired && (
          <Alert className="w-full" status="danger">
            <Alert.Indicator />
            <Alert.Content>
              <Alert.Title>{t('defi:bridge.confirmOrder.orderExpired')}</Alert.Title>
              <Alert.Description>
                {t('defi:bridge.confirmOrder.orderExpiredHint')}
              </Alert.Description>
            </Alert.Content>
          </Alert>
        )}
      </KeyboardAwareScrollView>
    </Page.Stack>
  );
}
