import type { UseQueryOptions } from '@tanstack/react-query';
import { queryOptions, useQuery } from '@tanstack/react-query';

import type { ChangeLocaleRequest } from '../pipes/users.pipe';
import { changeLocale } from '../services/users.service';

type UseQuerySyncLocaleOptions = Omit<
  UseQueryOptions<void, Error, ChangeLocaleRequest>,
  'queryKey' | 'queryFn'
>;

export const querySyncLocaleOptions = (
  request: ChangeLocaleRequest,
  options?: UseQuerySyncLocaleOptions,
) => {
  return queryOptions({
    queryKey: ['cefi/me', 'v1/me:change-locale'],
    queryFn: () => changeLocale(request),
    ...options,
  });
};

export const useQuerySyncLocale = (
  request: ChangeLocaleRequest,
  options?: UseQuerySyncLocaleOptions,
) => {
  return useQuery(querySyncLocaleOptions(request, options));
};
