import type { InfiniteData, UseInfiniteQueryOptions, UseQueryOptions } from '@tanstack/react-query';
import {
  infiniteQueryOptions,
  queryOptions,
  useInfiniteQuery,
  useQuery,
} from '@tanstack/react-query';

import type { GetOnrampOrdersRequest, OnrampOrderListItem } from '../pipes/onramp.pipe';
import { getOnrampOrders } from '../services/onramp.service';

export const ONRAMP_ORDERS_PER_PAGE = 20;

type OnrampOrdersResponse = Awaited<ReturnType<typeof getOnrampOrders>>;

type UseQueryOnrampOrdersOptions = Omit<
  UseQueryOptions<OnrampOrdersResponse, Error>,
  'queryKey' | 'queryFn'
>;

type UseInfiniteQueryOnrampOrdersOptions = Omit<
  UseInfiniteQueryOptions<
    OnrampOrdersResponse,
    Error,
    InfiniteData<OnrampOrdersResponse>,
    readonly ['cefi/onramp-orders', 'v1/onramp-orders', 'infinite'],
    number
  >,
  'queryKey' | 'queryFn' | 'initialPageParam' | 'getNextPageParam'
>;

export const onrampOrdersInfiniteQueryKey = [
  'cefi/onramp-orders',
  'v1/onramp-orders',
  'infinite',
] as const;

const getOnrampOrdersNextPageParam = (lastPage: OnrampOrdersResponse) => {
  const meta = lastPage.meta;

  if (!meta || meta.currentPage >= meta.totalPages) {
    return undefined;
  }

  return meta.currentPage + 1;
};

export const flattenOnrampOrdersPages = (
  pages: OnrampOrdersResponse[] | undefined,
): OnrampOrderListItem[] => {
  if (!pages) {
    return [];
  }

  const seen = new Set<string>();
  const orders: OnrampOrderListItem[] = [];

  for (const page of pages) {
    for (const order of page.data) {
      const id = String(order.id);

      if (seen.has(id)) {
        continue;
      }

      seen.add(id);
      orders.push(order);
    }
  }

  return orders;
};

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
    queryKey: onrampOrdersInfiniteQueryKey,
    queryFn: ({ pageParam }) =>
      getOnrampOrders({
        finPerPage: ONRAMP_ORDERS_PER_PAGE,
        finPage: String(pageParam),
      }),
    initialPageParam: 1,
    getNextPageParam: getOnrampOrdersNextPageParam,
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
