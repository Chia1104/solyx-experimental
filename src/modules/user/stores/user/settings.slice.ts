import type { SettingsActions, SettingsState, UserStoreSlice } from './types';

export const createSettingsInitialState = (): SettingsState => ({
  languageCode: 'en',
  walletMode: '',
  unlockMode: 'password',
  autoLock: true,
  switchModeHint: {
    isDisabledDefi: false,
  },
  notification: {
    isDisabledDefi: false,
  },
});

export const createSettingsSlice: UserStoreSlice<SettingsActions> = set => ({
  switchWalletMode: walletMode => {
    set(state => ({ settings: { ...state.settings, walletMode } }));
  },

  setUnlockMode: unlockMode => {
    set(state => ({ settings: { ...state.settings, unlockMode } }));
  },

  setAutoLock: enabled => {
    set(state => ({ settings: { ...state.settings, autoLock: enabled } }));
  },

  updateSwitchModeHint: (mode, isDisabled) => {
    set(state => ({
      settings: {
        ...state.settings,
        switchModeHint: {
          ...state.settings.switchModeHint,
          isDisabledDefi: isDisabled,
        },
      },
    }));
  },

  updateNotifeeState: (mode, isDisabled) => {
    set(state => ({
      settings: {
        ...state.settings,
        notification: {
          ...state.settings.notification,
          isDisabledDefi: isDisabled,
        },
      },
    }));
  },

  changeLanguageCode: code => {
    set(state => ({ settings: { ...state.settings, languageCode: code } }));
  },
});
