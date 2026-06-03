import { useLocalSearchParams, useRouter } from 'expo-router';

import { TransactionConfirm } from '@/components/defi/transisaction-confirm';
import { Page } from '@/components/page';
import { KeyboardAwareScrollView } from '@/components/ui/keyboard-aware-scroll-view';
import { ChainType } from '@/modules/chain/stores/chain-adapter/types';
import type { TransactionConfirmParams } from '@/modules/chain/utils/transaction-confirm';
import { useDefiAccount } from '@/modules/defi/hooks/use-defi-account';

export default function SendConfirmScreen() {
  const router = useRouter();
  const { chainType } = useDefiAccount();
  const params = useLocalSearchParams<{
    to?: string;
    value?: string;
    method?: string;
    data?: string;
    token?: string;
    tokenAddress?: string;
    gas?: string;
    gasLimit?: string;
    gasPrice?: string;
    nonce?: string;
    suppressSuccessModal?: string;
  }>();

  const sendParams: TransactionConfirmParams = {
    to: params.to ?? '',
    value: params.value ?? '0',
    method: params.method,
    data: params.data,
    tokenAddress: params.tokenAddress ?? params.token,
    gas: params.gas,
    gasLimit: params.gasLimit,
    gasPrice: params.gasPrice,
    nonce: params.nonce,
    suppressSuccessModal: params.suppressSuccessModal === 'true',
  };

  const activeChainType = chainType ?? ChainType.EVM;

  return (
    <Page.Stack>
      <KeyboardAwareScrollView contentContainerClassName="pt-6 pb-8">
        <TransactionConfirm
          chainType={activeChainType}
          onCancel={router.back}
          onDismissAfterSuccess={() => {
            router.replace('/send');
          }}
          onGoToActivity={() => {
            router.replace('/activity');
          }}
          sendParams={sendParams}
        />
      </KeyboardAwareScrollView>
    </Page.Stack>
  );
}
