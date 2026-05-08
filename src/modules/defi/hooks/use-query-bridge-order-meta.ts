import type { UseQueryOptions } from '@tanstack/react-query';
import { queryOptions, useQuery } from '@tanstack/react-query';

import type { BridgeOrderMeta, GetBridgeOrderMetaRequest } from '../pipes/bridges.pipe';
import { getBridgeOrderMeta } from '../services/bridges.service';

type UseQueryBridgeOrderMetaOptions = Omit<
  UseQueryOptions<BridgeOrderMeta, Error>,
  'queryKey' | 'queryFn'
>;

export const queryBridgeOrderMetaOptions = (
  request: GetBridgeOrderMetaRequest,
  options?: UseQueryBridgeOrderMetaOptions,
) => {
  return queryOptions({
    queryKey: ['defi/bridges/meta', 'v1/bridges/meta', request],
    queryFn: () => getBridgeOrderMeta(request),
    ...options,
  });
};

export const useQueryBridgeOrderMeta = (
  request: GetBridgeOrderMetaRequest,
  options?: UseQueryBridgeOrderMetaOptions,
) => {
  return useQuery(queryBridgeOrderMetaOptions(request, options));
};
