import { useMemo } from 'react';

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
    { enabled: hasPassword },
  );
  const hasBiometryPasswordCredentialQuery = useQueryHasKeychainGenericPassword(
    env.EXPO_PUBLIC_WALLET_BIOMETRY_DEFI_PASSWORD_SERVICE,
    {
      enabled: hasPassword && unlockMode === 'biometry',
    },
  );

  const hasPasswordCredentialData = hasPasswordCredentialQuery.data;
  const hasBiometryPasswordCredentialData = hasBiometryPasswordCredentialQuery.data;
  const isPasswordCredentialLoading = hasPasswordCredentialQuery.isLoading;
  const isBiometryPasswordCredentialLoading = hasBiometryPasswordCredentialQuery.isLoading;

  return useMemo(() => {
    const hasPasswordCredential = hasPassword && hasPasswordCredentialData === true;
    const hasBiometryPasswordCredential =
      hasPassword && unlockMode === 'biometry' && hasBiometryPasswordCredentialData === true;

    const isKeychainLoading =
      hasPassword &&
      (isPasswordCredentialLoading ||
        (unlockMode === 'biometry' && isBiometryPasswordCredentialLoading));

    let phase: EntryPhase = EntryPhase.Main;

    if (!hasPassword) {
      phase = EntryPhase.SetPassword;
    } else if (isKeychainLoading) {
      phase = EntryPhase.Loading;
    } else if (!hasPasswordCredential) {
      phase = EntryPhase.SetPassword;
    } else if (unlockMode === 'biometry' && !hasBiometryPasswordCredential) {
      phase = EntryPhase.LegacyBiometryMigration;
    } else if (!isStartupDone) {
      phase = EntryPhase.AppLock;
    } else if (!hasHDWallet && !isLogin) {
      phase = EntryPhase.Login;
    } else if (!hasHDWallet) {
      phase = EntryPhase.Onboarding;
    }

    return {
      hasPasswordCredential,
      isLoading: phase === EntryPhase.Loading,
      phase,
    };
  }, [
    hasBiometryPasswordCredentialData,
    hasHDWallet,
    hasPassword,
    hasPasswordCredentialData,
    isBiometryPasswordCredentialLoading,
    isLogin,
    isPasswordCredentialLoading,
    isStartupDone,
    unlockMode,
  ]);
};
