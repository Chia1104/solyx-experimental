import type { UseMutationOptions } from '@tanstack/react-query';
import { mutationOptions, useMutation } from '@tanstack/react-query';

import { resetKeychainCefiRefreshToken } from '../services/keychain.service';

type UseMutationResetKeychainCefiRefreshTokenOptions = Omit<
  UseMutationOptions<void, Error, void>,
  'mutationKey' | 'mutationFn'
>;

export const mutationResetKeychainCefiRefreshTokenOptions = (
  options?: UseMutationResetKeychainCefiRefreshTokenOptions,
) => {
  return mutationOptions({
    mutationKey: ['keychain', 'reset-cefi-refresh-token'],
    mutationFn: resetKeychainCefiRefreshToken,
    ...options,
  });
};

export const useMutationResetKeychainCefiRefreshToken = (
  options?: UseMutationResetKeychainCefiRefreshTokenOptions,
) => {
  return useMutation(mutationResetKeychainCefiRefreshTokenOptions(options));
};
