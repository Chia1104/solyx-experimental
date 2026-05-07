import type { UseMutationOptions } from '@tanstack/react-query';
import { mutationOptions, useMutation } from '@tanstack/react-query';

import type { CefiAuthTokens, SignInRequest } from '../pipes/tokens.pipe';
import { signIn } from '../services/tokens.service';

type UseMutationSignInOptions = Omit<
  UseMutationOptions<CefiAuthTokens, Error, SignInRequest>,
  'mutationKey' | 'mutationFn'
>;

export const mutationSignInOptions = (options?: UseMutationSignInOptions) => {
  return mutationOptions({
    mutationKey: ['cefi/tokens', 'v1/tokens'],
    mutationFn: signIn,
    ...options,
  });
};

export const useMutationSignIn = (options?: UseMutationSignInOptions) => {
  return useMutation(mutationSignInOptions(options));
};
