import type { UseQueryOptions } from '@tanstack/react-query';
import { queryOptions, useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { BIOMETRY_TYPE } from 'react-native-keychain';

import { getBiometryType } from '../utils';

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

const getBiometryLabelKey = (type?: BIOMETRY_TYPE | null) => {
  switch (type) {
    case BIOMETRY_TYPE.FACE_ID:
      return 'label.biometry.face.id' as const;
    case BIOMETRY_TYPE.TOUCH_ID:
      return 'label.biometry.touch.id' as const;
    case BIOMETRY_TYPE.FACE:
      return 'label.biometry.face.unlock' as const;
    case BIOMETRY_TYPE.FINGERPRINT:
      return 'label.biometry.fingerprint.unlock' as const;
    default:
      return null;
  }
};

export const useQueryBiometryType = (options?: UseQueryBiometryTypeOptions) => {
  const { t } = useTranslation(['global']);
  const result = useQuery(queryBiometryTypeOptions(options));
  const biometryLabelKey = getBiometryLabelKey(result.data);
  const biometryLabel = biometryLabelKey ? t(biometryLabelKey) : null;
  return { ...result, biometryLabel };
};
