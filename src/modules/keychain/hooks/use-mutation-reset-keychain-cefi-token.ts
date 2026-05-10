import type { UseMutationOptions } from '@tanstack/react-query';
import { mutationOptions, useMutation } from '@tanstack/react-query';

import { resetKeychainCefiToken } from '../services/keychain.service';

type UseMutationResetKeychainCefiTokenOptions = Omit<
  UseMutationOptions<void, Error, void>,
  'mutationKey' | 'mutationFn'
>;

export const mutationResetKeychainCefiTokenOptions = (
  options?: UseMutationResetKeychainCefiTokenOptions,
) => {
  return mutationOptions({
    mutationKey: ['keychain', 'reset-cefi-token'],
    mutationFn: resetKeychainCefiToken,
    ...options,
  });
};

export const useMutationResetKeychainCefiToken = (
  options?: UseMutationResetKeychainCefiTokenOptions,
) => {
  return useMutation(mutationResetKeychainCefiTokenOptions(options));
};
