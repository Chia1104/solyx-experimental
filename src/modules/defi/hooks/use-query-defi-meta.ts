import type { UseQueryOptions } from '@tanstack/react-query';
import { queryOptions, useQuery } from '@tanstack/react-query';

import type { DefiMeta } from '../pipes/meta.pipe';
import { getDefiMeta } from '../services/meta.service';

type UseQueryDefiMetaOptions = Omit<UseQueryOptions<DefiMeta, Error>, 'queryKey' | 'queryFn'>;

export const queryDefiMetaOptions = (options?: UseQueryDefiMetaOptions) => {
  return queryOptions({
    queryKey: ['defi/meta', 'v1/meta'],
    queryFn: getDefiMeta,
    ...options,
  });
};

export const useQueryDefiMeta = (options?: UseQueryDefiMetaOptions) => {
  return useQuery(queryDefiMetaOptions(options));
};
