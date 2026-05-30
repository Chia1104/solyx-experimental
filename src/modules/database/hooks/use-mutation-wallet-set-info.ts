import type { UseMutationOptions } from '@tanstack/react-query';
import { mutationOptions, useMutation, useQueryClient } from '@tanstack/react-query';

import type { WalletItem } from '@/modules/user/stores/user/types';

import { setWalletInfo } from '../repos/wallet.repo';

import { walletQueryKeys } from './wallet-query-keys';

type SetWalletInfoVariables = Pick<WalletItem, 'image' | 'name'> & { address: string };

type UseMutationWalletSetInfoOptions = Omit<
  UseMutationOptions<WalletItem[], Error, SetWalletInfoVariables>,
  'mutationKey' | 'mutationFn'
>;

export const mutationWalletSetInfoOptions = (options?: UseMutationWalletSetInfoOptions) =>
  mutationOptions({
    mutationKey: [...walletQueryKeys.all, 'set-info'],
    mutationFn: setWalletInfo,
    ...options,
  });

export const useMutationWalletSetInfo = (options?: UseMutationWalletSetInfoOptions) => {
  const queryClient = useQueryClient();

  return useMutation(
    mutationWalletSetInfoOptions({
      ...options,
      onSuccess: (...args) => {
        void queryClient.invalidateQueries({ queryKey: walletQueryKeys.all });
        options?.onSuccess?.(...args);
      },
    }),
  );
};
