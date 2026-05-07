import type { QueryOptions } from '@tanstack/react-query';
import { queryOptions, useQuery } from '@tanstack/react-query';

import type { GetOnrampOrderDetailRequest, OnrampOrderDetail } from '../pipes/onramp.pipe';
import { getOnrampOrder } from '../services/onramp.service';

type UseQueryOnrampOrderOptions = Omit<
  QueryOptions<OnrampOrderDetail, Error>,
  'queryKey' | 'queryFn'
>;

export const queryOnrampOrderOptions = (
  request: GetOnrampOrderDetailRequest,
  options?: UseQueryOnrampOrderOptions,
) => {
  return queryOptions({
    queryKey: [
      'cefi/onramp-orders',
      `v1/onramp-orders/${request.orderId}`,
      request.syncWithProvider,
    ],
    queryFn: () => getOnrampOrder(request),
    ...options,
  });
};

export const useQueryOnrampOrder = (
  request: GetOnrampOrderDetailRequest,
  options?: UseQueryOnrampOrderOptions,
) => {
  return useQuery(queryOnrampOrderOptions(request, options));
};
