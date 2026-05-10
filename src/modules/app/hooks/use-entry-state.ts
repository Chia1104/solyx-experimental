import { env } from '@/libs/env';
import { useQueryHasKeychainGenericPassword } from '@/modules/keychain/hooks/use-query-has-keychain-generic-password';
import { useUserStore } from '@/modules/user/stores/user';

import { EntryPhase } from '../enums/entry-phase.enum';
import { useGlobalStore } from '../stores/global';

export const useEntryState = () => {
  const hasPassword = useUserStore(state => state.account.hasPassword);
  const hasHDWallet = useUserStore(state => state.account.hasHDWallet);
  const isStartupDone = useGlobalStore(store => store.isStartupDone);

  const hasPasswordCredentialQuery = useQueryHasKeychainGenericPassword(
    env.EXPO_PUBLIC_WALLET_DEFI_PASSWORD_SERVICE,
  );

  if (hasPassword && hasPasswordCredentialQuery.isLoading) {
    return {
      hasPasswordCredential: false,
      isLoading: true,
      phase: EntryPhase.Loading,
    };
  }

  const hasPasswordCredential = hasPassword ? Boolean(hasPasswordCredentialQuery.data) : false;

  if (!hasPasswordCredential) {
    return {
      hasPasswordCredential,
      isLoading: false,
      phase: EntryPhase.SetPassword,
    };
  }

  if (!hasHDWallet) {
    return {
      hasPasswordCredential,
      isLoading: false,
      phase: EntryPhase.Onboarding,
    };
  }

  if (hasPassword && hasHDWallet && !isStartupDone) {
    return {
      hasPasswordCredential,
      isLoading: false,
      phase: EntryPhase.AppLock,
    };
  }

  return {
    hasPasswordCredential,
    isLoading: false,
    phase: EntryPhase.Main,
  };
};
