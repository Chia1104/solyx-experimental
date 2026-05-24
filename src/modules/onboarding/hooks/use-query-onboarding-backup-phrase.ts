import type { UseQueryOptions } from '@tanstack/react-query';
import { queryOptions, useQuery } from '@tanstack/react-query';

import { getKeychainPhrase } from '@/modules/keychain/services/keychain.service';

import { useOnboardingSessionStore } from '../stores/onboarding-session';

type UseQueryOnboardingBackupPhraseOptions = Omit<
  UseQueryOptions<string, Error>,
  'queryKey' | 'queryFn'
>;

export const queryOnboardingBackupPhraseOptions = (
  appLockPassword: string | null,
  options?: UseQueryOnboardingBackupPhraseOptions,
) => {
  return queryOptions({
    queryKey: ['onboarding', 'backup-phrase'],
    queryFn: () => {
      if (!appLockPassword) {
        throw new Error('Onboarding app lock password is not available');
      }

      return getKeychainPhrase({ password: appLockPassword });
    },
    enabled: Boolean(appLockPassword),
    gcTime: 0,
    ...options,
  });
};

export const useQueryOnboardingBackupPhrase = (options?: UseQueryOnboardingBackupPhraseOptions) => {
  const appLockPassword = useOnboardingSessionStore(state => state.appLockPassword);

  return useQuery(queryOnboardingBackupPhraseOptions(appLockPassword, options));
};
