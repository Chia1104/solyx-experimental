import type { UseMutationOptions } from '@tanstack/react-query';
import { mutationOptions, useMutation } from '@tanstack/react-query';

import type { GetKeychainPrivateKeyVariables } from '../services/keychain.service';
import { getKeychainPrivateKey } from '../services/keychain.service';

type UseMutationGetKeychainPrivateKeyOptions = Omit<
  UseMutationOptions<string, Error, GetKeychainPrivateKeyVariables>,
  'mutationKey' | 'mutationFn'
>;

export const mutationGetKeychainPrivateKeyOptions = (
  options?: UseMutationGetKeychainPrivateKeyOptions,
) => {
  return mutationOptions({
    mutationKey: ['keychain', 'get-private-key'],
    mutationFn: getKeychainPrivateKey,
    ...options,
  });
};

export const useMutationGetKeychainPrivateKey = (
  options?: UseMutationGetKeychainPrivateKeyOptions,
) => {
  return useMutation(mutationGetKeychainPrivateKeyOptions(options));
};
