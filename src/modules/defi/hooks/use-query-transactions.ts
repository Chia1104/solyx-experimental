import type { QueryOptions } from '@tanstack/react-query';
import { queryOptions, useQuery } from '@tanstack/react-query';

import type { GetTransactionsRequest, TransactionsResponse } from '../pipes/wallets.pipe';
import { getTransactions } from '../services/wallets.service';

type UseQueryTransactionsOptions = Omit<
  QueryOptions<TransactionsResponse, Error>,
  'queryKey' | 'queryFn'
>;

export const queryTransactionsOptions = (
  request: GetTransactionsRequest,
  options?: UseQueryTransactionsOptions,
) => {
  return queryOptions({
    queryKey: ['defi/transactions', 'v1/defi/transactions', request],
    queryFn: () => getTransactions(request),
    gcTime: 0,
    ...options,
  });
};

export const useQueryTransactions = (
  request: GetTransactionsRequest,
  options?: UseQueryTransactionsOptions,
) => {
  return useQuery(queryTransactionsOptions(request, options));
};
