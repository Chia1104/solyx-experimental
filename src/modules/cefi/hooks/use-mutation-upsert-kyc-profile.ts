import type { UseMutationOptions } from '@tanstack/react-query';
import { mutationOptions, useMutation } from '@tanstack/react-query';

import type { KYCProfileUpsertRequest } from '../pipes/kyc.pipe';
import { upsertKYCProfile } from '../services/kyc.service';

type UseMutationUpsertKYCProfileOptions = Omit<
  UseMutationOptions<void, Error, KYCProfileUpsertRequest>,
  'mutationKey' | 'mutationFn'
>;

export const mutationUpsertKYCProfileOptions = (options?: UseMutationUpsertKYCProfileOptions) => {
  return mutationOptions({
    mutationKey: ['cefi/kyc-profile', 'v1/kyc-profile:upsert'],
    mutationFn: upsertKYCProfile,
    ...options,
  });
};

export const useMutationUpsertKYCProfile = (options?: UseMutationUpsertKYCProfileOptions) => {
  return useMutation(mutationUpsertKYCProfileOptions(options));
};
