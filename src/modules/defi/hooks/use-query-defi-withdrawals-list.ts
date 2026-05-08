import type { UseQueryOptions } from '@tanstack/react-query';
import { queryOptions, useQuery } from '@tanstack/react-query';

import type {
  DefiWithdrawalsListResponse,
  GetDefiWithdrawalsListRequest,
} from '../pipes/withdrawals.pipe';
import { getDefiWithdrawalsList } from '../services/withdrawals.service';

type UseQueryDefiWithdrawalsListOptions = Omit<
  UseQueryOptions<DefiWithdrawalsListResponse, Error>,
  'queryKey' | 'queryFn'
>;

export const queryDefiWithdrawalsListOptions = (
  request: GetDefiWithdrawalsListRequest = {},
  options?: UseQueryDefiWithdrawalsListOptions,
) => {
  return queryOptions({
    queryKey: ['defi/withdrawals', 'v1/defi-withdrawals', request],
    queryFn: () => getDefiWithdrawalsList(request),
    ...options,
  });
};

export const useQueryDefiWithdrawalsList = (
  request?: GetDefiWithdrawalsListRequest,
  options?: UseQueryDefiWithdrawalsListOptions,
) => {
  return useQuery(queryDefiWithdrawalsListOptions(request, options));
};
