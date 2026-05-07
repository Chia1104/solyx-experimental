import type { UseMutationOptions } from '@tanstack/react-query';
import { mutationOptions, useMutation } from '@tanstack/react-query';

import type { CefiAuthTokens, RefreshTokenRequest } from '../pipes/tokens.pipe';
import { refreshToken } from '../services/tokens.service';

type UseMutationRefreshTokenOptions = Omit<
  UseMutationOptions<CefiAuthTokens, Error, RefreshTokenRequest>,
  'mutationKey' | 'mutationFn'
>;

export const mutationRefreshTokenOptions = (options?: UseMutationRefreshTokenOptions) => {
  return mutationOptions({
    mutationKey: ['cefi/tokens', 'v1/tokens:refresh'],
    mutationFn: refreshToken,
    ...options,
  });
};

export const useMutationRefreshToken = (options?: UseMutationRefreshTokenOptions) => {
  return useMutation(mutationRefreshTokenOptions(options));
};
