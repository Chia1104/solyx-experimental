import { useCallback, useState } from 'react';

import { useFocusEffect, useRouter } from 'expo-router';
import { useToast } from 'heroui-native';
import { useTranslation } from 'react-i18next';

import type { OrderFormSubmitValues } from '@/components/bridge/order-form';
import { OrderForm } from '@/components/bridge/order-form';
import { Page } from '@/components/page';
import { TabScreenScrollView } from '@/components/ui/tab-screen-scroll-view';
import { useMutationCreateBridgeFixedRateOrder } from '@/modules/defi/hooks/use-mutation-create-bridge-fixed-rate-order';
import { useQueryBridgeMetaPairs } from '@/modules/defi/hooks/use-query-bridge-meta-pairs';

export default function BridgeScreen() {
  const router = useRouter();
  const { t } = useTranslation(['defi']);
  const { toast } = useToast();
  const [isFocused, setIsFocused] = useState(false);
  const { data: orderPairs = [] } = useQueryBridgeMetaPairs({
    enabled: isFocused,
  });
  const createOrder = useMutationCreateBridgeFixedRateOrder();

  useFocusEffect(
    useCallback(() => {
      setIsFocused(true);

      return () => setIsFocused(false);
    }, []),
  );

  const handleSubmit = async (values: OrderFormSubmitValues) => {
    try {
      const order = await createOrder.mutateAsync({
        fromChainId: values.fromChainId,
        toChainId: values.toChainId,
        fromToken: values.fromToken,
        toToken: values.toToken,
        fromAddress: values.fromAddress,
        refundAddress: values.refundAddress,
        toAddress: values.takerAddress,
        amount: values.amount,
        rateId: values.estimatedFee.rateId,
      });

      router.push({
        pathname: '/bridge/confirm',
        params: {
          orderId: order.id,
          bridgeOrderId: order.bridgeOrderId,
          paymentTargetAddress: order.paymentTargetAddress,
          amount: order.amount,
          receivedAmount: order.receivedAmount,
          platformFee: order.platformFee,
          feeAmountToken: order.feeAmountToken ?? '',
          expiresAt: order.expiresAt,
          fromChainId: values.fromChainId,
          toChainId: values.toChainId,
          fromToken: values.fromToken,
          toToken: values.toToken,
          toAddress: values.takerAddress,
        },
      });
    } catch {
      toast.show({
        description: t('defi:bridge.errors.create-order-failed'),
        variant: 'danger',
      });
    }
  };

  return (
    <Page.Tab>
      <TabScreenScrollView
        stackHeaderInset
        contentContainerClassName="gap-5 px-3"
        tabBarAdditionalPadding={24}
      >
        {isFocused ? (
          <OrderForm
            isSubmitting={createOrder.isPending}
            orderPairs={orderPairs}
            onSubmit={handleSubmit}
          />
        ) : null}
      </TabScreenScrollView>
    </Page.Tab>
  );
}
