import BigNumber from 'bignumber.js';
import { useRouter } from 'expo-router';
import { useToast } from 'heroui-native';
import { useTranslation } from 'react-i18next';

import type { OrderFormSubmitValues } from '@/components/bridge/order-form';
import { OrderForm } from '@/components/bridge/order-form';
import { Page } from '@/components/page';
import { TabScreenScrollView } from '@/components/ui/tab-screen-scroll-view';
import { SupportedChainID } from '@/modules/chain/enums/supported-chain.enum';
import { useDefiAccount } from '@/modules/defi/hooks/use-defi-account';
import { useMutationCreateBridgeFixedRateOrder } from '@/modules/defi/hooks/use-mutation-create-bridge-fixed-rate-order';
import { useQueryBridgeMetaPairs } from '@/modules/defi/hooks/use-query-bridge-meta-pairs';

const getBridgeFromAddress = (
  chainId: string,
  addresses: ReturnType<typeof useDefiAccount>['addresses'],
) => {
  switch (chainId) {
    case SupportedChainID.EthereumMainnet:
    case SupportedChainID.EthereumTestnet:
      return addresses.evm;
    case SupportedChainID.TronMainnet:
    case SupportedChainID.TronShasta:
      return addresses.tron;
    case SupportedChainID.LiquidMainnet:
    case SupportedChainID.LiquidTestnet:
    case SupportedChainID.LiquidMainnetID:
    case SupportedChainID.LiquidTestnetID:
      return addresses.liquid;
    default:
      return '';
  }
};

export default function BridgeScreen() {
  const router = useRouter();
  const { t } = useTranslation(['defi']);
  const { toast } = useToast();
  const { addresses } = useDefiAccount();
  const { data: orderPairs = [] } = useQueryBridgeMetaPairs();
  const createOrder = useMutationCreateBridgeFixedRateOrder();

  const handleSubmit = async (values: OrderFormSubmitValues) => {
    try {
      const order = await createOrder.mutateAsync({
        fromChainId: values.fromChainId,
        toChainId: values.toChainId,
        fromToken: values.fromToken,
        toToken: values.toToken,
        fromAddress: getBridgeFromAddress(values.fromChainId, addresses),
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
          amount: new BigNumber(order.amount).toString(),
          receivedAmount: new BigNumber(order.receivedAmount).toString(),
          platformFee: new BigNumber(order.platformFee).toString(),
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
        <OrderForm
          isSubmitting={createOrder.isPending}
          orderPairs={orderPairs}
          onSubmit={handleSubmit}
        />
      </TabScreenScrollView>
    </Page.Tab>
  );
}
