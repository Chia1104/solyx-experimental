import type { UseQueryOptions } from '@tanstack/react-query';
import { queryOptions, useQuery } from '@tanstack/react-query';

import type { Meta } from '../pipes/meta.pipe';
import { getMeta } from '../services/meta.service';

type UseQueryMetaOptions = Omit<UseQueryOptions<Meta, Error>, 'queryKey' | 'queryFn'>;

export const queryMetaOptions = (options?: UseQueryMetaOptions) => {
  return queryOptions({
    queryKey: ['cefi/meta', 'v1/meta'],
    queryFn: getMeta,
    ...options,
  });
};

export const useQueryMeta = (options?: UseQueryMetaOptions) => {
  return useQuery(queryMetaOptions(options));
};
