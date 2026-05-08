import type { UseQueryOptions } from '@tanstack/react-query';
import { queryOptions, useQuery } from '@tanstack/react-query';

import type { GetOnrampOrdersRequest } from '../pipes/onramp.pipe';
import { getOnrampOrders } from '../services/onramp.service';

type OnrampOrdersResponse = Awaited<ReturnType<typeof getOnrampOrders>>;

type UseQueryOnrampOrdersOptions = Omit<
  UseQueryOptions<OnrampOrdersResponse, Error>,
  'queryKey' | 'queryFn'
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

export const useQueryOnrampOrders = (
  request?: GetOnrampOrdersRequest,
  options?: UseQueryOnrampOrdersOptions,
) => {
  return useQuery(queryOnrampOrdersOptions(request, options));
};
