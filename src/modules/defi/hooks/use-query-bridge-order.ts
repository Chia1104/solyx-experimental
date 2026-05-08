import type { UseQueryOptions } from '@tanstack/react-query';
import { queryOptions, useQuery } from '@tanstack/react-query';

import type { BridgeOrder, GetBridgeOrderRequest } from '../pipes/bridges.pipe';
import { getBridgeOrder } from '../services/bridges.service';

type UseQueryBridgeOrderOptions = Omit<UseQueryOptions<BridgeOrder, Error>, 'queryKey' | 'queryFn'>;

export const queryBridgeOrderOptions = (
  request: GetBridgeOrderRequest,
  options?: UseQueryBridgeOrderOptions,
) => {
  return queryOptions({
    queryKey: ['defi/bridges/orders', `v1/bridges/orders/${request.id}`],
    queryFn: () => getBridgeOrder(request),
    ...options,
  });
};

export const useQueryBridgeOrder = (
  request: GetBridgeOrderRequest,
  options?: UseQueryBridgeOrderOptions,
) => {
  return useQuery(queryBridgeOrderOptions(request, options));
};
