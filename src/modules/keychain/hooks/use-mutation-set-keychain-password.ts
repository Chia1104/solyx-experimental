import type { UseMutationOptions } from '@tanstack/react-query';
import { mutationOptions, useMutation } from '@tanstack/react-query';

import { env } from '@/libs/env';
import { queryClient } from '@/libs/request/query-client';

import type { SetKeychainPasswordVariables } from '../services/keychain.service';
import { setKeychainPassword } from '../services/keychain.service';

import { queryHasKeychainGenericPasswordOptions } from './use-query-has-keychain-generic-password';

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
    onSuccess: (data, variables, onMutateResult, context) => {
      const hasPasswordQueryOptions = queryHasKeychainGenericPasswordOptions(
        env.EXPO_PUBLIC_WALLET_DEFI_PASSWORD_SERVICE,
      );

      queryClient.setQueryData(hasPasswordQueryOptions.queryKey, true);

      return options?.onSuccess?.(data, variables, onMutateResult, context);
    },
  });
};

export const useMutationSetKeychainPassword = (options?: UseMutationSetKeychainPasswordOptions) => {
  return useMutation(mutationSetKeychainPasswordOptions(options));
};
