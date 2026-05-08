import type { UseQueryOptions } from '@tanstack/react-query';
import { queryOptions, useQuery } from '@tanstack/react-query';

import type { Banners } from '../pipes/banners.pipe';
import { getBanners } from '../services/banners.service';

type UseQueryBannersOptions = Omit<UseQueryOptions<Banners, Error>, 'queryKey' | 'queryFn'>;

export const queryBannersOptions = (options?: UseQueryBannersOptions) => {
  return queryOptions({
    queryKey: ['cefi/banners', 'v1/banners'],
    queryFn: getBanners,
    ...options,
  });
};

export const useQueryBanners = (options?: UseQueryBannersOptions) => {
  return useQuery(queryBannersOptions(options));
};
