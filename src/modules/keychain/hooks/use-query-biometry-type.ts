import type { UseQueryOptions } from '@tanstack/react-query';
import { queryOptions, useQuery } from '@tanstack/react-query';
import type { BIOMETRY_TYPE } from 'react-native-keychain';

import { getBiometryType } from '@/modules/keychain/utils';

type UseQueryBiometryTypeOptions = Omit<
  UseQueryOptions<BIOMETRY_TYPE | null, Error>,
  'queryKey' | 'queryFn'
>;

export const queryBiometryTypeOptions = (options?: UseQueryBiometryTypeOptions) => {
  return queryOptions({
    queryKey: ['keychain', 'biometry-type'],
    queryFn: getBiometryType,
    ...options,
  });
};

export const useQueryBiometryType = (options?: UseQueryBiometryTypeOptions) => {
  return useQuery(queryBiometryTypeOptions(options));
};
