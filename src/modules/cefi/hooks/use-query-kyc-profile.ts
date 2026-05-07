import type { QueryOptions } from '@tanstack/react-query';
import { queryOptions, useQuery } from '@tanstack/react-query';

import type { KYCProfile } from '../pipes/kyc.pipe';
import { getKYCProfile } from '../services/kyc.service';

type UseQueryKYCProfileOptions = Omit<QueryOptions<KYCProfile, Error>, 'queryKey' | 'queryFn'>;

export const queryKYCProfileOptions = (options?: UseQueryKYCProfileOptions) => {
  return queryOptions({
    queryKey: ['cefi/kyc-profile', 'v1/kyc-profile'],
    queryFn: getKYCProfile,
    ...options,
  });
};

export const useQueryKYCProfile = (options?: UseQueryKYCProfileOptions) => {
  return useQuery(queryKYCProfileOptions(options));
};
