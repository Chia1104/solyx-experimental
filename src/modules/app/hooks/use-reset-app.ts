import type { UseMutationOptions } from '@tanstack/react-query';
import { mutationOptions, useMutation } from '@tanstack/react-query';

import { resetApp } from '@/modules/app/services/reset-app.service';

type UseMutationResetAppOptions = Omit<
  UseMutationOptions<void, Error, void>,
  'mutationKey' | 'mutationFn'
>;

export const mutationResetAppOptions = (options?: UseMutationResetAppOptions) =>
  mutationOptions({
    mutationKey: ['app', 'reset'],
    mutationFn: resetApp,
    ...options,
  });

export const useMutationResetApp = (options?: UseMutationResetAppOptions) => {
  return useMutation(mutationResetAppOptions(options));
};
