import type { UseMutationOptions } from '@tanstack/react-query';
import { mutationOptions, useMutation } from '@tanstack/react-query';

import type { GetKeychainPhraseVariables } from '../services/keychain.service';
import { getKeychainPhrase } from '../services/keychain.service';

type UseMutationGetKeychainPhraseOptions = Omit<
  UseMutationOptions<string, Error, GetKeychainPhraseVariables>,
  'mutationKey' | 'mutationFn'
>;

export const mutationGetKeychainPhraseOptions = (options?: UseMutationGetKeychainPhraseOptions) => {
  return mutationOptions({
    mutationKey: ['keychain', 'get-phrase'],
    mutationFn: getKeychainPhrase,
    ...options,
  });
};

export const useMutationGetKeychainPhrase = (options?: UseMutationGetKeychainPhraseOptions) => {
  return useMutation(mutationGetKeychainPhraseOptions(options));
};
