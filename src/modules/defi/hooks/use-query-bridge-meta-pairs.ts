import type { UseQueryOptions } from '@tanstack/react-query';
import { queryOptions, useQuery } from '@tanstack/react-query';

import type { BridgeMetaPairs } from '../pipes/bridges.pipe';
import { getBridgeMetaPairs } from '../services/bridges.service';

type UseQueryBridgeMetaPairsOptions = Omit<
  UseQueryOptions<BridgeMetaPairs, Error>,
  'queryKey' | 'queryFn'
>;

export const queryBridgeMetaPairsOptions = (options?: UseQueryBridgeMetaPairsOptions) => {
  return queryOptions({
    queryKey: ['defi/bridges/meta', 'v1/bridges/meta/pairs'],
    queryFn: getBridgeMetaPairs,
    ...options,
  });
};

export const useQueryBridgeMetaPairs = (options?: UseQueryBridgeMetaPairsOptions) => {
  return useQuery(queryBridgeMetaPairsOptions(options));
};
