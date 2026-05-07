import type { UseMutationOptions } from '@tanstack/react-query';
import { mutationOptions, useMutation } from '@tanstack/react-query';

import type { CreateBridgeFixedRateOrderRequest, CreateBridgeOrder } from '../pipes/bridges.pipe';
import { createBridgeFixedRateOrder } from '../services/bridges.service';

type UseMutationCreateBridgeFixedRateOrderOptions = Omit<
  UseMutationOptions<CreateBridgeOrder, Error, CreateBridgeFixedRateOrderRequest>,
  'mutationKey' | 'mutationFn'
>;

export const mutationCreateBridgeFixedRateOrderOptions = (
  options?: UseMutationCreateBridgeFixedRateOrderOptions,
) => {
  return mutationOptions({
    mutationKey: ['defi/bridges/orders', 'v1/bridges/orders:create-fixed-rate'],
    mutationFn: createBridgeFixedRateOrder,
    ...options,
  });
};

export const useMutationCreateBridgeFixedRateOrder = (
  options?: UseMutationCreateBridgeFixedRateOrderOptions,
) => {
  return useMutation(mutationCreateBridgeFixedRateOrderOptions(options));
};
