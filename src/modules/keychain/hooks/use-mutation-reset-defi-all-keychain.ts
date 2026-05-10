import type { UseMutationOptions } from '@tanstack/react-query';
import { mutationOptions, useMutation } from '@tanstack/react-query';

import type { ResetDefiAllKeychainVariables } from '../services/keychain.service';
import { resetDefiAllKeychain } from '../services/keychain.service';

type UseMutationResetDefiAllKeychainOptions = Omit<
  UseMutationOptions<boolean, Error, ResetDefiAllKeychainVariables>,
  'mutationKey' | 'mutationFn'
>;

export const mutationResetDefiAllKeychainOptions = (
  options?: UseMutationResetDefiAllKeychainOptions,
) => {
  return mutationOptions({
    mutationKey: ['keychain', 'reset-defi-all'],
    mutationFn: resetDefiAllKeychain,
    ...options,
  });
};

export const useMutationResetDefiAllKeychain = (
  options?: UseMutationResetDefiAllKeychainOptions,
) => {
  return useMutation(mutationResetDefiAllKeychainOptions(options));
};
