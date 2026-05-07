import type { QueryOptions } from '@tanstack/react-query';
import { queryOptions, useQuery } from '@tanstack/react-query';

import type { DefiWithdrawalsMeta } from '../pipes/withdrawals.pipe';
import { getDefiWithdrawalsMeta } from '../services/withdrawals.service';

type UseQueryDefiWithdrawalsMetaOptions = Omit<
  QueryOptions<DefiWithdrawalsMeta, Error>,
  'queryKey' | 'queryFn'
>;

export const queryDefiWithdrawalsMetaOptions = (options?: UseQueryDefiWithdrawalsMetaOptions) => {
  return queryOptions({
    queryKey: ['defi/withdrawals', 'v1/defi-withdrawals/meta'],
    queryFn: getDefiWithdrawalsMeta,
    ...options,
  });
};

export const useQueryDefiWithdrawalsMeta = (options?: UseQueryDefiWithdrawalsMetaOptions) => {
  return useQuery(queryDefiWithdrawalsMetaOptions(options));
};
