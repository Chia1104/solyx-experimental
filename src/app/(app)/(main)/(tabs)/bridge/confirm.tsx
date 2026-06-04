import { useMemo } from 'react';

import { useLocalSearchParams, useRouter } from 'expo-router';
import { Typography, useToast } from 'heroui-native';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { TransactionConfirm } from '@/components/defi/transisaction-confirm';
import { Page } from '@/components/page';
import { KeyboardAwareScrollView } from '@/components/ui/keyboard-aware-scroll-view';
import { ChainType } from '@/modules/chain/stores/chain-adapter/types';
import type { TransactionConfirmParams } from '@/modules/chain/utils/transaction-confirm';
import { useDefiAccount } from '@/modules/defi/hooks/use-defi-account';
import { useMutationUpdateBridgePaymentTxHash } from '@/modules/defi/hooks/use-mutation-update-bridge-payment-tx-hash';

export default function BridgeConfirmScreen() {
  const { t } = useTranslation(['defi']);
  const { toast } = useToast();
  const router = useRouter();
  const { chainType } = useDefiAccount();
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

  const updatePaymentTxHash = useMutationUpdateBridgePaymentTxHash({
    onError: () => {
      toast.show({
        variant: 'warning',
        description: t('defi:error.unknown.error'),
      });
    },
  });

  const {
    orderId,
    paymentTargetAddress,
    amount,
    receivedAmount,
    platformFee,
    feeAmountToken,
    expiresAt,
    fromToken,
    toToken,
    toAddress,
  } = params;

  const isParamsValid = !!orderId && !!paymentTargetAddress && !!amount;

  const isOrderExpired = useMemo(
    () => !!expiresAt && new Date(expiresAt) <= new Date(),
    [expiresAt],
  );

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

  const handleSuccess = async (txHash: string) => {
    if (!orderId) return;
    await updatePaymentTxHash.mutateAsync({ id: orderId, txHash, gasFee: '0' });
    router.replace('/bridge');
  };

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
      <KeyboardAwareScrollView contentContainerClassName="pt-6 pb-8">
        {/* Order summary */}
        <View className="gap-3 px-6 pb-4">
          <View className="bg-content1 gap-3 rounded-xl p-4">
            <View className="flex-row items-center justify-between">
              <Typography className="text-foreground/60" type="body-sm">
                {t('defi:bridge.confirmOrder.from')}
              </Typography>
              <Typography className="text-foreground font-medium" type="body-sm">
                {amount} {fromToken}
              </Typography>
            </View>

            <View className="flex-row items-center justify-between">
              <Typography className="text-foreground/60" type="body-sm">
                {t('defi:bridge.confirmOrder.to')}
              </Typography>
              <Typography className="text-foreground font-medium" type="body-sm">
                {receivedAmount} {toToken}
              </Typography>
            </View>

            {!!platformFee && (
              <View className="flex-row items-center justify-between">
                <Typography className="text-foreground/60" type="body-sm">
                  {t('defi:bridge.confirmOrder.platform.fee')}
                </Typography>
                <Typography className="text-foreground" type="body-sm">
                  {platformFee} {feeAmountToken}
                </Typography>
              </View>
            )}

            {!!toAddress && (
              <View className="flex-row items-start justify-between gap-4">
                <Typography className="text-foreground/60 shrink-0" type="body-sm">
                  {t('defi:bridge.confirmOrder.address')}
                </Typography>
                <Typography
                  className="text-foreground flex-1 text-right"
                  numberOfLines={2}
                  type="body-xs"
                >
                  {toAddress}
                </Typography>
              </View>
            )}

            {!!expiresAt && (
              <View className="flex-row items-center justify-between">
                <Typography className="text-foreground/60" type="body-sm">
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
          </View>

          {isOrderExpired && (
            <View className="bg-danger/10 rounded-xl p-3">
              <Typography className="text-danger text-center" type="body-sm">
                {t('defi:bridge.confirmOrder.orderExpired')}
              </Typography>
              <Typography className="text-danger/70 mt-1 text-center" type="body-xs">
                {t('defi:bridge.confirmOrder.orderExpiredHint')}
              </Typography>
            </View>
          )}
        </View>

        {/* Transaction signing — handles gas estimation, signing, broadcast for all chain types */}
        {!isOrderExpired && (
          <TransactionConfirm
            chainType={activeChainType}
            onCancel={router.back}
            onDismissAfterSuccess={() => router.replace('/bridge')}
            onGoToActivity={() => router.replace('/activity')}
            onSuccess={handleSuccess}
            sendParams={sendParams}
          />
        )}
      </KeyboardAwareScrollView>
    </Page.Stack>
  );
}
