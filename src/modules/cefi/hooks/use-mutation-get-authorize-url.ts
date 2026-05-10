import type { UseMutationOptions } from '@tanstack/react-query';
import { mutationOptions, useMutation } from '@tanstack/react-query';

import type { AuthorizeUrl, GetAuthorizeUrlRequest } from '../pipes/users.pipe';
import { getAuthorizeUrl } from '../services/users.service';

type UseMutationGetAuthorizeUrlOptions = Omit<
  UseMutationOptions<AuthorizeUrl, Error, GetAuthorizeUrlRequest>,
  'mutationKey' | 'mutationFn'
>;

export const mutationGetAuthorizeUrlOptions = (options?: UseMutationGetAuthorizeUrlOptions) => {
  return mutationOptions({
    mutationKey: ['cefi/users', 'v1/users:get-authorize-url'],
    mutationFn: getAuthorizeUrl,
    ...options,
  });
};

export const useMutationGetAuthorizeUrl = (options?: UseMutationGetAuthorizeUrlOptions) => {
  return useMutation(mutationGetAuthorizeUrlOptions(options));
};
