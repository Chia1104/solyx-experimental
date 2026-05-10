import type { UseMutationOptions } from '@tanstack/react-query';
import { mutationOptions, useMutation } from '@tanstack/react-query';

import type { GetDefiAllKeychainDataVariables, KeychainData } from '../services/keychain.service';
import { getDefiAllKeychainData } from '../services/keychain.service';

type UseMutationGetDefiAllKeychainDataOptions = Omit<
  UseMutationOptions<KeychainData[], Error, GetDefiAllKeychainDataVariables>,
  'mutationKey' | 'mutationFn'
>;

export const mutationGetDefiAllKeychainDataOptions = (
  options?: UseMutationGetDefiAllKeychainDataOptions,
) => {
  return mutationOptions({
    mutationKey: ['keychain', 'get-defi-all'],
    mutationFn: getDefiAllKeychainData,
    ...options,
  });
};

export const useMutationGetDefiAllKeychainData = (
  options?: UseMutationGetDefiAllKeychainDataOptions,
) => {
  return useMutation(mutationGetDefiAllKeychainDataOptions(options));
};
