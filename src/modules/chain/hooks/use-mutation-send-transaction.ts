import type { UseMutationOptions } from '@tanstack/react-query';
import { useMutation } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';

import { useLockRequest } from '@/modules/app/hooks/use-lock-request';
import { resolveTransactionPrivateKey } from '@/modules/chain/services/resolve-transaction-private-key';
import { executeSendTransaction } from '@/modules/chain/services/send-transaction';
import type { SendTransactionVariables } from '@/modules/chain/services/send-transaction';
import { useChainAdapterStore } from '@/modules/chain/stores/chain-adapter';

type UseMutationSendTransactionOptions = Omit<
  UseMutationOptions<string | null, Error, SendTransactionVariables>,
  'mutationKey' | 'mutationFn'
>;

export const useMutationSendTransaction = (options?: UseMutationSendTransactionOptions) => {
  const { requestLiquidUnlock, requestPrivateKey } = useLockRequest();
  const getAdapterByChainId = useChainAdapterStore(state => state.getAdapterByChainId);
  const { t } = useTranslation(['global']);

  return useMutation({
    mutationKey: ['chain', 'send-transaction'],
    mutationFn: async (variables: SendTransactionVariables) => {
      const privateKey = await resolveTransactionPrivateKey({
        chainType: variables.chainType,
        currentChainId: variables.currentChainId,
        requestLiquidUnlock,
        requestPrivateKey,
        reason: t('global:description.input.password.to.process'),
      });

      return executeSendTransaction({
        ...variables,
        privateKey,
        getAdapterByChainId,
      });
    },
    ...options,
  });
};
