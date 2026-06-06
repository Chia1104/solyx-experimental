import type { UseQueryOptions } from '@tanstack/react-query';
import { queryOptions, useQuery, useInfiniteQuery } from '@tanstack/react-query';

import type { UseInfiniteQueryOptions } from '@/libs/request/infinite-query-options';
import { infiniteQueryOptions } from '@/libs/request/infinite-query-options';

import type { BridgeOrdersResponse, GetBridgeOrdersRequest } from '../pipes/bridges.pipe';
import { getBridgeOrders } from '../services/bridges.service';

type UseQueryBridgeOrdersOptions = Omit<
  UseQueryOptions<BridgeOrdersResponse, Error>,
  'queryKey' | 'queryFn'
>;

type UseInfiniteQueryBridgeOrdersOptions = Omit<
  UseInfiniteQueryOptions<BridgeOrdersResponse['data'][0], Error>,
  'queryKey' | 'queryFn' | 'initialPageParam' | 'getNextPageParam'
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

export const infiniteQueryBridgeOrdersOptions = (options?: UseInfiniteQueryBridgeOrdersOptions) => {
  return infiniteQueryOptions({
    queryKey: ['defi/bridges/orders', 'v1/bridges/orders', 'infinite'],
    queryFn: ({ pageParam }) =>
      getBridgeOrders({
        finPerPage: '20',
        finPage: pageParam,
      }),
    ...options,
  });
};

export const useQueryBridgeOrders = (
  request?: GetBridgeOrdersRequest,
  options?: UseQueryBridgeOrdersOptions,
) => {
  return useQuery(queryBridgeOrdersOptions(request, options));
};

export const useInfiniteQueryBridgeOrders = (options?: UseInfiniteQueryBridgeOrdersOptions) => {
  return useInfiniteQuery(infiniteQueryBridgeOrdersOptions(options));
};
