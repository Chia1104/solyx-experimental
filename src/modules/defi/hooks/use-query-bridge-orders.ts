import type { UseQueryOptions } from '@tanstack/react-query';
import { queryOptions, useQuery } from '@tanstack/react-query';

import type { BridgeOrdersResponse, GetBridgeOrdersRequest } from '../pipes/bridges.pipe';
import { getBridgeOrders } from '../services/bridges.service';

type UseQueryBridgeOrdersOptions = Omit<
  UseQueryOptions<BridgeOrdersResponse, Error>,
  'queryKey' | 'queryFn'
>;

export const queryBridgeOrdersOptions = (
  request: GetBridgeOrdersRequest = {},
  options?: UseQueryBridgeOrdersOptions,
) => {
  return queryOptions({
    queryKey: ['defi/bridges/orders', 'v1/bridges/orders', request],
    queryFn: () => getBridgeOrders(request),
    ...options,
  });
};

export const useQueryBridgeOrders = (
  request?: GetBridgeOrdersRequest,
  options?: UseQueryBridgeOrdersOptions,
) => {
  return useQuery(queryBridgeOrdersOptions(request, options));
};
