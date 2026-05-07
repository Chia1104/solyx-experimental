import type { QueryOptions } from '@tanstack/react-query';
import { queryOptions, useQuery } from '@tanstack/react-query';

import type { BridgeSupportedChains } from '../pipes/bridges.pipe';
import { getBridgeSupportedChains } from '../services/bridges.service';

type UseQueryBridgeSupportedChainsOptions = Omit<
  QueryOptions<BridgeSupportedChains, Error>,
  'queryKey' | 'queryFn'
>;

export const queryBridgeSupportedChainsOptions = (
  options?: UseQueryBridgeSupportedChainsOptions,
) => {
  return queryOptions({
    queryKey: ['defi/bridges', 'v1/bridges/supported-chains'],
    queryFn: getBridgeSupportedChains,
    ...options,
  });
};

export const useQueryBridgeSupportedChains = (options?: UseQueryBridgeSupportedChainsOptions) => {
  return useQuery(queryBridgeSupportedChainsOptions(options));
};
