import type { UseMutationOptions } from '@tanstack/react-query';
import { mutationOptions, useMutation, useQueryClient } from '@tanstack/react-query';

import type { WalletItem } from '@/modules/user/stores/user/types';

import { resetWallets } from '../repos/wallet.repo';

import { walletQueryKeys } from './wallet-query-keys';

type UseMutationWalletResetOptions = Omit<
  UseMutationOptions<WalletItem[], Error, void>,
  'mutationKey' | 'mutationFn'
>;

export const mutationWalletResetOptions = (options?: UseMutationWalletResetOptions) =>
  mutationOptions({
    mutationKey: [...walletQueryKeys.all, 'reset'],
    mutationFn: resetWallets,
    ...options,
  });

export const useMutationWalletReset = (options?: UseMutationWalletResetOptions) => {
  const queryClient = useQueryClient();

  return useMutation(
    mutationWalletResetOptions({
      ...options,
      onSuccess: (...args) => {
        void queryClient.invalidateQueries({ queryKey: walletQueryKeys.all });
        options?.onSuccess?.(...args);
      },
    }),
  );
};
