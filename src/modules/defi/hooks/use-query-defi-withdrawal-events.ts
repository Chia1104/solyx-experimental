import type { UseQueryOptions } from '@tanstack/react-query';
import { queryOptions, useQuery } from '@tanstack/react-query';

import type {
  DefiWithdrawalEventsResponse,
  GetDefiWithdrawalEventsRequest,
} from '../pipes/withdrawals.pipe';
import { getDefiWithdrawalEvents } from '../services/withdrawals.service';

type UseQueryDefiWithdrawalEventsOptions = Omit<
  UseQueryOptions<DefiWithdrawalEventsResponse, Error>,
  'queryKey' | 'queryFn'
>;

export const queryDefiWithdrawalEventsOptions = (
  request: GetDefiWithdrawalEventsRequest,
  options?: UseQueryDefiWithdrawalEventsOptions,
) => {
  return queryOptions({
    queryKey: ['defi/withdrawals', `v1/defi-withdrawals/${request.id}/events`, request],
    queryFn: () => getDefiWithdrawalEvents(request),
    ...options,
  });
};

export const useQueryDefiWithdrawalEvents = (
  request: GetDefiWithdrawalEventsRequest,
  options?: UseQueryDefiWithdrawalEventsOptions,
) => {
  return useQuery(queryDefiWithdrawalEventsOptions(request, options));
};
