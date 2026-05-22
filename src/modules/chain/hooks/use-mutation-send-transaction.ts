import type { UseMutationOptions } from '@tanstack/react-query';
import { useMutation } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';

import { useGlobalStore } from '@/modules/app/stores/global';
import { useLiquidSession } from '@/modules/chain/hooks/use-liquid-session';
import {
  executeSendTransaction,
  resolveTransactionPrivateKey,
} from '@/modules/chain/services/send-transaction';
import type { SendTransactionVariables } from '@/modules/chain/services/send-transaction';
import { useChainAdapterStore } from '@/modules/chain/stores/chain-adapter';

type UseMutationSendTransactionOptions = Omit<
  UseMutationOptions<string | null, Error, SendTransactionVariables>,
  'mutationKey' | 'mutationFn'
>;

export const useMutationSendTransaction = (options?: UseMutationSendTransactionOptions) => {
  const requestLock = useGlobalStore(state => state.requestLock);
  const getAdapterByChainId = useChainAdapterStore(state => state.getAdapterByChainId);
  const { ensureLiquidSession } = useLiquidSession();
  const { t } = useTranslation(['global']);

  return useMutation({
    mutationKey: ['chain', 'send-transaction'],
    mutationFn: async (variables: SendTransactionVariables) => {
      const privateKey = await resolveTransactionPrivateKey({
        chainType: variables.chainType,
        currentChainId: variables.currentChainId,
        ensureLiquidSession,
        requestLock,
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
