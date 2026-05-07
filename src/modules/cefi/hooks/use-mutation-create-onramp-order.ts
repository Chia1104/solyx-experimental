import type { UseMutationOptions } from '@tanstack/react-query';
import { mutationOptions, useMutation } from '@tanstack/react-query';

import type { CreateOnrampOrder, CreateOnrampOrderRequest } from '../pipes/onramp.pipe';
import { createOnrampOrder } from '../services/onramp.service';

type UseMutationCreateOnrampOrderOptions = Omit<
  UseMutationOptions<CreateOnrampOrder, Error, CreateOnrampOrderRequest>,
  'mutationKey' | 'mutationFn'
>;

export const mutationCreateOnrampOrderOptions = (options?: UseMutationCreateOnrampOrderOptions) => {
  return mutationOptions({
    mutationKey: ['cefi/onramp-orders', 'v1/onramp-orders'],
    mutationFn: createOnrampOrder,
    ...options,
  });
};

export const useMutationCreateOnrampOrder = (options?: UseMutationCreateOnrampOrderOptions) => {
  return useMutation(mutationCreateOnrampOrderOptions(options));
};
