import type { UseMutationOptions } from '@tanstack/react-query';
import { mutationOptions, useMutation } from '@tanstack/react-query';

import type { GetKeychainPasswordVariables } from '../services/keychain.service';
import { getKeychainPassword } from '../services/keychain.service';

type UseMutationGetKeychainPasswordOptions = Omit<
  UseMutationOptions<string, Error, GetKeychainPasswordVariables>,
  'mutationKey' | 'mutationFn'
>;

export const mutationGetKeychainPasswordOptions = (
  options?: UseMutationGetKeychainPasswordOptions,
) => {
  return mutationOptions({
    mutationKey: ['keychain', 'get-password'],
    mutationFn: getKeychainPassword,
    ...options,
  });
};

export const useMutationGetKeychainPassword = (options?: UseMutationGetKeychainPasswordOptions) => {
  return useMutation(mutationGetKeychainPasswordOptions(options));
};
