import type { UseQueryOptions } from '@tanstack/react-query';
import { queryOptions, useQuery } from '@tanstack/react-query';

import { env } from '@/libs/env';

import { hasKeychainGenericPassword } from '../utils';

type UseQueryHasKeychainGenericPasswordOptions = Omit<
  UseQueryOptions<boolean, Error>,
  'queryKey' | 'queryFn'
>;

export const queryHasKeychainGenericPasswordOptions = (
  service = env.EXPO_PUBLIC_WALLET_DEFI_PASSWORD_SERVICE,
  options?: UseQueryHasKeychainGenericPasswordOptions,
) => {
  return queryOptions({
    queryKey: ['keychain', 'has-generic-password', service],
    queryFn: () => hasKeychainGenericPassword(service),
    gcTime: 0,
    staleTime: 0,
    ...options,
  });
};

export const useQueryHasKeychainGenericPassword = (
  service = env.EXPO_PUBLIC_WALLET_DEFI_PASSWORD_SERVICE,
  options?: UseQueryHasKeychainGenericPasswordOptions,
) => {
  return useQuery(queryHasKeychainGenericPasswordOptions(service, options));
};
