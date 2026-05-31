import type { UseQueryOptions } from '@tanstack/react-query';
import { queryOptions, useInfiniteQuery, useQuery } from '@tanstack/react-query';

import type { UseInfiniteQueryOptions } from '@/libs/request/infinite-query-options';
import { infiniteQueryOptions } from '@/libs/request/infinite-query-options';

import type { GetOnrampOrdersRequest, OnrampOrderListItem } from '../pipes/onramp.pipe';
import { getOnrampOrders } from '../services/onramp.service';

export const ONRAMP_ORDERS_PER_PAGE = 20;

type OnrampOrdersResponse = Awaited<ReturnType<typeof getOnrampOrders>>;

type UseQueryOnrampOrdersOptions = Omit<
  UseQueryOptions<OnrampOrdersResponse, Error>,
  'queryKey' | 'queryFn'
>;

type UseInfiniteQueryOnrampOrdersOptions = Omit<
  UseInfiniteQueryOptions<OnrampOrderListItem, Error>,
  'queryKey' | 'queryFn' | 'initialPageParam' | 'getNextPageParam'
>;

export const queryOnrampOrdersOptions = (
  request: GetOnrampOrdersRequest = {},
  options?: UseQueryOnrampOrdersOptions,
) => {
  return queryOptions({
    queryKey: ['cefi/onramp-orders', 'v1/onramp-orders', request],
    queryFn: () => getOnrampOrders(request),
    ...options,
  });
};

export const infiniteQueryOnrampOrdersOptions = (options?: UseInfiniteQueryOnrampOrdersOptions) => {
  return infiniteQueryOptions({
    queryKey: ['cefi/onramp-orders', 'v1/onramp-orders', 'infinite'],
    queryFn: ({ pageParam }) =>
      getOnrampOrders({
        finPerPage: ONRAMP_ORDERS_PER_PAGE,
        finPage: String(pageParam),
      }),
    ...options,
  });
};

export const useQueryOnrampOrders = (
  request?: GetOnrampOrdersRequest,
  options?: UseQueryOnrampOrdersOptions,
) => {
  return useQuery(queryOnrampOrdersOptions(request, options));
};

export const useInfiniteQueryOnrampOrders = (options?: UseInfiniteQueryOnrampOrdersOptions) => {
  return useInfiniteQuery(infiniteQueryOnrampOrdersOptions(options));
};
