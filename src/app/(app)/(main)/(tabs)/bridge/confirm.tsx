import { Redirect, useLocalSearchParams } from 'expo-router';

import type { SupportedChainID } from '@/modules/chain/enums/supported-chain.enum';

import { BridgeConfirmContent } from './bridge-confirm-content';

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

  return <BridgeConfirmContent {...params} />;
}
