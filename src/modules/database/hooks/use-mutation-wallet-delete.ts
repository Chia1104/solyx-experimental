import type { UseMutationOptions } from '@tanstack/react-query';
import { mutationOptions, useMutation, useQueryClient } from '@tanstack/react-query';

import type { WalletItem } from '@/modules/user/stores/user/types';

import { deleteWallet } from '../repos/wallet.repo';

import { walletQueryKeys } from './wallet-query-keys';

type UseMutationWalletDeleteOptions = Omit<
  UseMutationOptions<WalletItem[], Error, string>,
  'mutationKey' | 'mutationFn'
>;

export const mutationWalletDeleteOptions = (options?: UseMutationWalletDeleteOptions) =>
  mutationOptions({
    mutationKey: [...walletQueryKeys.all, 'delete'],
    mutationFn: deleteWallet,
    ...options,
  });

export const useMutationWalletDelete = (options?: UseMutationWalletDeleteOptions) => {
  const queryClient = useQueryClient();

  return useMutation(
    mutationWalletDeleteOptions({
      ...options,
      onSuccess: (...args) => {
        void queryClient.invalidateQueries({ queryKey: walletQueryKeys.all });
        options?.onSuccess?.(...args);
      },
    }),
  );
};
