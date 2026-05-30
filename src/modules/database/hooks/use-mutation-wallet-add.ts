import type { UseMutationOptions } from '@tanstack/react-query';
import { mutationOptions, useMutation, useQueryClient } from '@tanstack/react-query';

import type { WalletItem } from '@/modules/user/stores/user/types';

import { addWallet } from '../repos/wallet.repo';

import { walletQueryKeys } from './wallet-query-keys';

type AddWalletVariables = Omit<WalletItem, 'id'> & { id?: string };

type UseMutationWalletAddOptions = Omit<
  UseMutationOptions<WalletItem, Error, AddWalletVariables>,
  'mutationKey' | 'mutationFn'
>;

export const mutationWalletAddOptions = (options?: UseMutationWalletAddOptions) =>
  mutationOptions({
    mutationKey: [...walletQueryKeys.all, 'add'],
    mutationFn: addWallet,
    ...options,
  });

export const useMutationWalletAdd = (options?: UseMutationWalletAddOptions) => {
  const queryClient = useQueryClient();

  return useMutation(
    mutationWalletAddOptions({
      ...options,
      onSuccess: (...args) => {
        void queryClient.invalidateQueries({ queryKey: walletQueryKeys.all });
        options?.onSuccess?.(...args);
      },
    }),
  );
};
