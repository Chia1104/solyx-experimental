import { createSettingsInitialState } from '@/modules/user/stores/user/settings.slice';
import type { SettingsState, UserPersistedState } from '@/modules/user/stores/user/types';

import type { LegacyReduxUserState } from '../legacy-redux-store';
import { resolveLegacyCurrentWalletId, toLegacyWalletItem } from './legacy-wallet.pipe';

export const mapLegacySettings = (
  settings: LegacyReduxUserState['settings'] | undefined,
): SettingsState | undefined => {
  if (!settings) {
    return undefined;
  }

  const defaults = createSettingsInitialState();

  return {
    languageCode: settings.languageCode ?? defaults.languageCode,
    languageWithDevice: defaults.languageWithDevice,
    devMode: defaults.devMode,
    walletMode: settings.walletMode ?? defaults.walletMode,
    unlockMode: settings.unlockMode ?? defaults.unlockMode,
    autoLock: settings.autoLock ?? defaults.autoLock,
    switchModeHint: {
      isDisabledDefi: settings.switchModeHint?.isDisabledDefi ?? defaults.switchModeHint.isDisabledDefi,
    },
    notification: {
      isDisabledDefi: settings.notification?.isDisabledDefi ?? defaults.notification.isDisabledDefi,
    },
  };
};

export const mapLegacyUserState = (
  user: LegacyReduxUserState,
): Partial<UserPersistedState> & {
  legacyWallets: ReturnType<typeof toLegacyWalletItem>[];
} => {
  const legacyWallets = (user.wallet?.wallets ?? []).map(toLegacyWalletItem);

  return {
    account: user.account
      ? {
          hasPassword: user.account.hasPassword ?? false,
          hasHDWallet: user.account.hasHDWallet ?? false,
          backupPhraseState: user.account.backupPhraseState ?? '',
          account: user.account.account ?? '',
        }
      : undefined,
    settings: mapLegacySettings(user.settings),
    wallet: {
      namespace: user.wallet?.namespace ?? 'eip155',
      currentChainId: user.wallet?.currentChainId ?? 1,
      currentWalletId: resolveLegacyCurrentWalletId(user.wallet, legacyWallets),
    },
    cefiUserAccount: user.cefiUserAccount,
    legacyWallets,
  };
};
