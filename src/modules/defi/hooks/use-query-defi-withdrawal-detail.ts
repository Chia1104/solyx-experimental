import type { QueryOptions } from '@tanstack/react-query';
import { queryOptions, useQuery } from '@tanstack/react-query';

import type {
  DefiWithdrawalDetail,
  GetDefiWithdrawalDetailRequest,
} from '../pipes/withdrawals.pipe';
import { getDefiWithdrawalDetail } from '../services/withdrawals.service';

type UseQueryDefiWithdrawalDetailOptions = Omit<
  QueryOptions<DefiWithdrawalDetail, Error>,
  'queryKey' | 'queryFn'
>;

export const queryDefiWithdrawalDetailOptions = (
  request: GetDefiWithdrawalDetailRequest,
  options?: UseQueryDefiWithdrawalDetailOptions,
) => {
  return queryOptions({
    queryKey: ['defi/withdrawals', `v1/defi-withdrawals/${request.id}`],
    queryFn: () => getDefiWithdrawalDetail(request),
    ...options,
  });
};

export const useQueryDefiWithdrawalDetail = (
  request: GetDefiWithdrawalDetailRequest,
  options?: UseQueryDefiWithdrawalDetailOptions,
) => {
  return useQuery(queryDefiWithdrawalDetailOptions(request, options));
};
