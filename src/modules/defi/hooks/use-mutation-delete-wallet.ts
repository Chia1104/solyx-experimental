import type { UseMutationOptions } from '@tanstack/react-query';
import { mutationOptions, useMutation } from '@tanstack/react-query';

import type { DeleteWalletRequest } from '../pipes/wallets.pipe';
import { deleteWallet } from '../services/wallets.service';

type UseMutationDeleteWalletOptions = Omit<
  UseMutationOptions<void, Error, DeleteWalletRequest>,
  'mutationKey' | 'mutationFn'
>;

export const mutationDeleteWalletOptions = (options?: UseMutationDeleteWalletOptions) => {
  return mutationOptions({
    mutationKey: ['defi/wallets', 'v1/defi/wallets:delete'],
    mutationFn: deleteWallet,
    ...options,
  });
};

export const useMutationDeleteWallet = (options?: UseMutationDeleteWalletOptions) => {
  return useMutation(mutationDeleteWalletOptions(options));
};
