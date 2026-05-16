import type { UseMutationOptions } from '@tanstack/react-query';
import { mutationOptions, useMutation } from '@tanstack/react-query';

import type { SetKeychainBiometryPasswordVariables } from '../services/keychain.service';
import { setKeychainBiometryPassword } from '../services/keychain.service';

type UseMutationSetKeychainBiometryPasswordOptions = Omit<
  UseMutationOptions<
    Awaited<ReturnType<typeof setKeychainBiometryPassword>>,
    Error,
    SetKeychainBiometryPasswordVariables
  >,
  'mutationKey' | 'mutationFn'
>;

export const mutationSetKeychainBiometryPasswordOptions = (
  options?: UseMutationSetKeychainBiometryPasswordOptions,
) => {
  return mutationOptions({
    mutationKey: ['keychain', 'set-biometry-password'],
    mutationFn: setKeychainBiometryPassword,
    ...options,
  });
};

export const useMutationSetKeychainBiometryPassword = (
  options?: UseMutationSetKeychainBiometryPasswordOptions,
) => {
  return useMutation(mutationSetKeychainBiometryPasswordOptions(options));
};
