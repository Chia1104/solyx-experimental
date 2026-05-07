import type { UseMutationOptions } from '@tanstack/react-query';
import { mutationOptions, useMutation } from '@tanstack/react-query';

import type { AddWalletRequest, WalletItems } from '../pipes/wallets.pipe';
import { addWallet } from '../services/wallets.service';

type UseMutationAddWalletOptions = Omit<
  UseMutationOptions<WalletItems, Error, AddWalletRequest>,
  'mutationKey' | 'mutationFn'
>;

export const mutationAddWalletOptions = (options?: UseMutationAddWalletOptions) => {
  return mutationOptions({
    mutationKey: ['defi/wallets', 'v1/defi/wallets'],
    mutationFn: addWallet,
    ...options,
  });
};

export const useMutationAddWallet = (options?: UseMutationAddWalletOptions) => {
  return useMutation(mutationAddWalletOptions(options));
};
