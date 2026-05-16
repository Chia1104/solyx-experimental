import { env } from '@/libs/env';
import { useQueryHasKeychainGenericPassword } from '@/modules/keychain/hooks/use-query-has-keychain-generic-password';
import { useUserStore } from '@/modules/user/stores/user';

import { EntryPhase } from '../enums/entry-phase.enum';
import { useGlobalStore } from '../stores/global';

export const useEntryState = () => {
  const hasPassword = useUserStore(state => state.account.hasPassword);
  const hasHDWallet = useUserStore(state => state.account.hasHDWallet);
  const unlockMode = useUserStore(state => state.settings.unlockMode);
  const isLogin = useUserStore(state => state.cefiUserAccount.isLogin);
  const isStartupDone = useGlobalStore(store => store.isStartupDone);

  const hasPasswordCredentialQuery = useQueryHasKeychainGenericPassword(
    env.EXPO_PUBLIC_WALLET_DEFI_PASSWORD_SERVICE,
  );
  const hasBiometryPasswordCredentialQuery = useQueryHasKeychainGenericPassword(
    env.EXPO_PUBLIC_WALLET_BIOMETRY_DEFI_PASSWORD_SERVICE,
    {
      enabled: hasPassword && unlockMode === 'biometry',
    },
  );

  if (
    hasPassword &&
    (hasPasswordCredentialQuery.isLoading ||
      (unlockMode === 'biometry' && hasBiometryPasswordCredentialQuery.isLoading))
  ) {
    return {
      hasPasswordCredential: false,
      isLoading: true,
      phase: EntryPhase.Loading,
    };
  }

  const hasPasswordCredential = hasPassword ? Boolean(hasPasswordCredentialQuery.data) : false;
  const hasBiometryPasswordCredential = hasPassword
    ? Boolean(hasBiometryPasswordCredentialQuery.data)
    : false;

  if (!hasPasswordCredential) {
    return {
      hasPasswordCredential,
      isLoading: false,
      phase: EntryPhase.SetPassword,
    };
  }

  if (hasPassword && unlockMode === 'biometry' && !hasBiometryPasswordCredential) {
    return {
      hasPasswordCredential,
      isLoading: false,
      phase: EntryPhase.LegacyBiometryMigration,
    };
  }

  if (hasPassword && !isStartupDone) {
    return {
      hasPasswordCredential,
      isLoading: false,
      phase: EntryPhase.AppLock,
    };
  }

  if (!hasHDWallet && !isLogin) {
    return {
      hasPasswordCredential,
      isLoading: false,
      phase: EntryPhase.Login,
    };
  }

  if (!hasHDWallet) {
    return {
      hasPasswordCredential,
      isLoading: false,
      phase: EntryPhase.Onboarding,
    };
  }

  return {
    hasPasswordCredential,
    isLoading: false,
    phase: EntryPhase.Main,
  };
};
