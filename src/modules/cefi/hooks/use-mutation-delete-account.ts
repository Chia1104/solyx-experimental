import type { UseMutationOptions } from '@tanstack/react-query';
import { mutationOptions, useMutation } from '@tanstack/react-query';

import { deleteAccount } from '../services/users.service';

type UseMutationDeleteAccountOptions = Omit<
  UseMutationOptions<void, Error, void>,
  'mutationKey' | 'mutationFn'
>;

export const mutationDeleteAccountOptions = (options?: UseMutationDeleteAccountOptions) => {
  return mutationOptions({
    mutationKey: ['cefi/me', 'v1/me'],
    mutationFn: deleteAccount,
    ...options,
  });
};

export const useMutationDeleteAccount = (options?: UseMutationDeleteAccountOptions) => {
  return useMutation(mutationDeleteAccountOptions(options));
};
