import type { UseMutationOptions } from '@tanstack/react-query';
import { mutationOptions, useMutation } from '@tanstack/react-query';

import type { KYCUploadURL, KYCUploadURLRequest } from '../pipes/kyc.pipe';
import { getKYCUploadURL } from '../services/kyc.service';

type UseMutationKYCUploadURLOptions = Omit<
  UseMutationOptions<KYCUploadURL, Error, KYCUploadURLRequest>,
  'mutationKey' | 'mutationFn'
>;

export const mutationKYCUploadURLOptions = (options?: UseMutationKYCUploadURLOptions) => {
  return mutationOptions({
    mutationKey: ['cefi/kyc-profile', 'v1/kyc-profile:get-upload-url'],
    mutationFn: getKYCUploadURL,
    ...options,
  });
};

export const useMutationKYCUploadURL = (options?: UseMutationKYCUploadURLOptions) => {
  return useMutation(mutationKYCUploadURLOptions(options));
};
