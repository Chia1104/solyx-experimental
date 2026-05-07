import type { UseMutationOptions } from '@tanstack/react-query';
import { mutationOptions, useMutation } from '@tanstack/react-query';

import type {
  BridgeFixedRateEstimatedFee,
  GetBridgeFixedRateEstimatedFeeRequest,
} from '../pipes/bridges.pipe';
import { getBridgeFixedRateEstimatedFee } from '../services/bridges.service';

type UseMutationBridgeFixedRateEstimatedFeeOptions = Omit<
  UseMutationOptions<BridgeFixedRateEstimatedFee, Error, GetBridgeFixedRateEstimatedFeeRequest>,
  'mutationKey' | 'mutationFn'
>;

export const mutationBridgeFixedRateEstimatedFeeOptions = (
  options?: UseMutationBridgeFixedRateEstimatedFeeOptions,
) => {
  return mutationOptions({
    mutationKey: ['defi/bridges/orders', 'v1/bridges/orders:get-fixed-rate-estimated-fee'],
    mutationFn: getBridgeFixedRateEstimatedFee,
    ...options,
  });
};

export const useMutationBridgeFixedRateEstimatedFee = (
  options?: UseMutationBridgeFixedRateEstimatedFeeOptions,
) => {
  return useMutation(mutationBridgeFixedRateEstimatedFeeOptions(options));
};
