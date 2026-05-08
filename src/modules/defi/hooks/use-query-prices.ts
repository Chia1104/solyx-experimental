import type { UseQueryOptions } from '@tanstack/react-query';
import { queryOptions, useQuery } from '@tanstack/react-query';

import type { Prices } from '../pipes/meta.pipe';
import { getPrices } from '../services/meta.service';

type UseQueryPricesOptions = Omit<UseQueryOptions<Prices, Error>, 'queryKey' | 'queryFn'>;

export const queryPricesOptions = (options?: UseQueryPricesOptions) => {
  return queryOptions({
    queryKey: ['defi/meta', 'v1/meta/prices'],
    queryFn: getPrices,
    ...options,
  });
};

export const useQueryPrices = (options?: UseQueryPricesOptions) => {
  return useQuery(queryPricesOptions(options));
};
