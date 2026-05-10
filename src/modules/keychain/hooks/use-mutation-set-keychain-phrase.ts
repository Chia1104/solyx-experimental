import type { UseMutationOptions } from '@tanstack/react-query';
import { mutationOptions, useMutation } from '@tanstack/react-query';

import type { SetKeychainPhraseVariables } from '../services/keychain.service';
import { setKeychainPhrase } from '../services/keychain.service';

type UseMutationSetKeychainPhraseOptions = Omit<
  UseMutationOptions<string, Error, SetKeychainPhraseVariables>,
  'mutationKey' | 'mutationFn'
>;

export const mutationSetKeychainPhraseOptions = (options?: UseMutationSetKeychainPhraseOptions) => {
  return mutationOptions({
    mutationKey: ['keychain', 'set-phrase'],
    mutationFn: setKeychainPhrase,
    ...options,
  });
};

export const useMutationSetKeychainPhrase = (options?: UseMutationSetKeychainPhraseOptions) => {
  return useMutation(mutationSetKeychainPhraseOptions(options));
};
