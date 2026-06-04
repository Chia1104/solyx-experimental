import type { UseQueryOptions } from '@tanstack/react-query';
import { queryOptions, useQuery } from '@tanstack/react-query';

import type {
  BridgeFixedRateEstimatedFee,
  GetBridgeFixedRateEstimatedFeeRequest,
} from '../pipes/bridges.pipe';
import { getBridgeFixedRateEstimatedFee } from '../services/bridges.service';

type UseQueryBridgeFixedRateEstimatedFeeOptions = Omit<
  UseQueryOptions<BridgeFixedRateEstimatedFee, Error>,
  'queryKey' | 'queryFn'
>;

export const queryBridgeFixedRateEstimatedFeeOptions = (
  request: GetBridgeFixedRateEstimatedFeeRequest,
  options?: UseQueryBridgeFixedRateEstimatedFeeOptions,
) => {
  return queryOptions({
    queryKey: ['defi/bridges/fixed-rate-fee', request],
    queryFn: () => getBridgeFixedRateEstimatedFee(request),
    staleTime: 0,
    gcTime: 0,
    retry: false,
    ...options,
  });
};

export const useQueryBridgeFixedRateEstimatedFee = (
  request: GetBridgeFixedRateEstimatedFeeRequest,
  options?: UseQueryBridgeFixedRateEstimatedFeeOptions,
) => {
  return useQuery(queryBridgeFixedRateEstimatedFeeOptions(request, options));
};
