import type { UseMutationOptions } from '@tanstack/react-query';
import { mutationOptions, useMutation } from '@tanstack/react-query';

import type { UpdateBridgePaymentTxHashRequest } from '../pipes/bridges.pipe';
import { updateBridgePaymentTxHash } from '../services/bridges.service';

type UseMutationUpdateBridgePaymentTxHashOptions = Omit<
  UseMutationOptions<void, Error, UpdateBridgePaymentTxHashRequest>,
  'mutationKey' | 'mutationFn'
>;

export const mutationUpdateBridgePaymentTxHashOptions = (
  options?: UseMutationUpdateBridgePaymentTxHashOptions,
) => {
  return mutationOptions({
    mutationKey: ['defi/bridges/orders', 'v1/bridges/orders:update-payment-txhash'],
    mutationFn: updateBridgePaymentTxHash,
    ...options,
  });
};

export const useMutationUpdateBridgePaymentTxHash = (
  options?: UseMutationUpdateBridgePaymentTxHashOptions,
) => {
  return useMutation(mutationUpdateBridgePaymentTxHashOptions(options));
};
