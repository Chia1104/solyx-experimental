import type { UseMutationOptions } from '@tanstack/react-query';
import { mutationOptions, useMutation } from '@tanstack/react-query';

import type { ChangeLocaleRequest } from '../pipes/users.pipe';
import { changeLocale } from '../services/users.service';

type UseMutationChangeLocaleOptions = Omit<
  UseMutationOptions<void, Error, ChangeLocaleRequest>,
  'mutationKey' | 'mutationFn'
>;

export const mutationChangeLocaleOptions = (options?: UseMutationChangeLocaleOptions) => {
  return mutationOptions({
    mutationKey: ['cefi/me', 'v1/me:change-locale'],
    mutationFn: changeLocale,
    ...options,
  });
};

export const useMutationChangeLocale = (options?: UseMutationChangeLocaleOptions) => {
  return useMutation(mutationChangeLocaleOptions(options));
};
