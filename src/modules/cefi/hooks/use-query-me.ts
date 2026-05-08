import type { UseQueryOptions } from '@tanstack/react-query';
import { queryOptions, useQuery } from '@tanstack/react-query';

import type { User } from '../pipes/users.pipe';
import { getMe } from '../services/users.service';

type UseQueryMeOptions = Omit<UseQueryOptions<User, Error>, 'queryKey' | 'queryFn'>;

export const queryMeOptions = (options?: UseQueryMeOptions) => {
  return queryOptions({
    queryKey: ['cefi/me', 'v1/me'],
    queryFn: getMe,
    ...options,
  });
};

export const useQueryMe = (options?: UseQueryMeOptions) => {
  return useQuery(queryMeOptions(options));
};
