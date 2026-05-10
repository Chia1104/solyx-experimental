import type { UseMutationOptions } from '@tanstack/react-query';
import { mutationOptions, useMutation } from '@tanstack/react-query';

import type { SetKeychainPrivateKeyVariables } from '../services/keychain.service';
import { setKeychainPrivateKey } from '../services/keychain.service';

type UseMutationSetKeychainPrivateKeyOptions = Omit<
  UseMutationOptions<
    Awaited<ReturnType<typeof setKeychainPrivateKey>>,
    Error,
    SetKeychainPrivateKeyVariables
  >,
  'mutationKey' | 'mutationFn'
>;

export const mutationSetKeychainPrivateKeyOptions = (
  options?: UseMutationSetKeychainPrivateKeyOptions,
) => {
  return mutationOptions({
    mutationKey: ['keychain', 'set-private-key'],
    mutationFn: setKeychainPrivateKey,
    ...options,
  });
};

export const useMutationSetKeychainPrivateKey = (
  options?: UseMutationSetKeychainPrivateKeyOptions,
) => {
  return useMutation(mutationSetKeychainPrivateKeyOptions(options));
};
