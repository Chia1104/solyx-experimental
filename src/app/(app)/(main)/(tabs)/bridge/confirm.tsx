import { Redirect, useLocalSearchParams } from 'expo-router';

import { BridgeConfirmContent } from '@/components/bridge/confirm';
import { Page } from '@/components/page';
import { KeyboardAwareScrollView } from '@/components/ui/keyboard-aware-scroll-view';
import type { SupportedChainID } from '@/modules/chain/enums/supported-chain.enum';

export default function BridgeConfirmScreen() {
  const params = useLocalSearchParams<{
    orderId?: string;
    bridgeOrderId?: string;
    paymentTargetAddress?: string;
    amount?: string;
    receivedAmount?: string;
    platformFee?: string;
    feeAmountToken?: string;
    expiresAt?: string;
    fromChainId?: SupportedChainID;
    toChainId?: SupportedChainID;
    fromToken?: string;
    toToken?: string;
    toAddress?: string;
  }>();
  const isParamsValid = !!params.orderId && !!params.paymentTargetAddress && !!params.amount;

  if (!isParamsValid) {
    return <Redirect href="/bridge" />;
  }

  return (
    <Page.Stack>
      <KeyboardAwareScrollView contentContainerClassName="p-6">
        <BridgeConfirmContent {...params} />
      </KeyboardAwareScrollView>
    </Page.Stack>
  );
}
