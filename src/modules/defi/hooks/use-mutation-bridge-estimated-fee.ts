import type { UseMutationOptions } from '@tanstack/react-query';
import { mutationOptions, useMutation } from '@tanstack/react-query';

import type { BridgeEstimatedFee, GetBridgeEstimatedFeeRequest } from '../pipes/bridges.pipe';
import { getBridgeEstimatedFee } from '../services/bridges.service';

type UseMutationBridgeEstimatedFeeOptions = Omit<
  UseMutationOptions<BridgeEstimatedFee, Error, GetBridgeEstimatedFeeRequest>,
  'mutationKey' | 'mutationFn'
>;

export const mutationBridgeEstimatedFeeOptions = (
  options?: UseMutationBridgeEstimatedFeeOptions,
) => {
  return mutationOptions({
    mutationKey: ['defi/bridges/orders', 'v1/bridges/orders:get-estimated-fee'],
    mutationFn: getBridgeEstimatedFee,
    ...options,
  });
};

export const useMutationBridgeEstimatedFee = (options?: UseMutationBridgeEstimatedFeeOptions) => {
  return useMutation(mutationBridgeEstimatedFeeOptions(options));
};
