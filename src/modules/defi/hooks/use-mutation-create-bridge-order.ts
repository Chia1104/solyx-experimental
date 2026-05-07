import type { UseMutationOptions } from '@tanstack/react-query';
import { mutationOptions, useMutation } from '@tanstack/react-query';

import type { CreateBridgeOrder, CreateBridgeOrderRequest } from '../pipes/bridges.pipe';
import { createBridgeOrder } from '../services/bridges.service';

type UseMutationCreateBridgeOrderOptions = Omit<
  UseMutationOptions<CreateBridgeOrder, Error, CreateBridgeOrderRequest>,
  'mutationKey' | 'mutationFn'
>;

export const mutationCreateBridgeOrderOptions = (options?: UseMutationCreateBridgeOrderOptions) => {
  return mutationOptions({
    mutationKey: ['defi/bridges/orders', 'v1/bridges/orders'],
    mutationFn: createBridgeOrder,
    ...options,
  });
};

export const useMutationCreateBridgeOrder = (options?: UseMutationCreateBridgeOrderOptions) => {
  return useMutation(mutationCreateBridgeOrderOptions(options));
};
