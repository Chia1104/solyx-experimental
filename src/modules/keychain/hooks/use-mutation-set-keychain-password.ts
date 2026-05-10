import type { UseMutationOptions } from '@tanstack/react-query';
import { mutationOptions, useMutation } from '@tanstack/react-query';

import type { SetKeychainPasswordVariables } from '../services/keychain.service';
import { setKeychainPassword } from '../services/keychain.service';

type UseMutationSetKeychainPasswordOptions = Omit<
  UseMutationOptions<
    Awaited<ReturnType<typeof setKeychainPassword>>,
    Error,
    SetKeychainPasswordVariables
  >,
  'mutationKey' | 'mutationFn'
>;

export const mutationSetKeychainPasswordOptions = (
  options?: UseMutationSetKeychainPasswordOptions,
) => {
  return mutationOptions({
    mutationKey: ['keychain', 'set-password'],
    mutationFn: setKeychainPassword,
    ...options,
  });
};

export const useMutationSetKeychainPassword = (options?: UseMutationSetKeychainPasswordOptions) => {
  return useMutation(mutationSetKeychainPasswordOptions(options));
};
