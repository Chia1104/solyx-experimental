import { createMMKV } from 'react-native-mmkv';
import { create } from 'zustand';
import type { StateStorage } from 'zustand/middleware';
import { createJSONStorage, persist } from 'zustand/middleware';

import { createAccountInitialState, createAccountSlice } from './account.slice';
import {
  createCefiUserAccountInitialState,
  createCefiUserAccountSlice,
} from './cefi-user-account.slice';
import { createSettingsInitialState, createSettingsSlice } from './settings.slice';
import type { UserPersistedState, UserStoreState } from './types';
import { createWalletInitialState, createWalletSlice } from './wallet.slice';

const userStoreMMKV = createMMKV({
  id: 'user-store',
});

const userStoreStorage: StateStorage = {
  getItem: name => userStoreMMKV.getString(name) ?? null,
  setItem: (name, value) => {
    userStoreMMKV.set(name, value);
  },
  removeItem: name => {
    userStoreMMKV.remove(name);
  },
};

export const createUserInitialState = (): UserPersistedState => ({
  account: createAccountInitialState(),
  settings: createSettingsInitialState(),
  wallet: createWalletInitialState(),
  cefiUserAccount: createCefiUserAccountInitialState(),
});

const mergeUserState = (
  currentState: UserPersistedState,
  nextState: Partial<UserPersistedState>,
): UserPersistedState => ({
  account: {
    ...currentState.account,
    ...nextState.account,
  },
  settings: {
    ...currentState.settings,
    ...nextState.settings,
    switchModeHint: {
      ...currentState.settings.switchModeHint,
      ...nextState.settings?.switchModeHint,
    },
    notification: {
      ...currentState.settings.notification,
      ...nextState.settings?.notification,
    },
  },
  wallet: {
    ...currentState.wallet,
    ...nextState.wallet,
  },
  cefiUserAccount: {
    ...currentState.cefiUserAccount,
    ...nextState.cefiUserAccount,
    userData: {
      ...currentState.cefiUserAccount.userData,
      ...nextState.cefiUserAccount?.userData,
    },
  },
});

export const useUserStore = create<UserStoreState>()(
  persist(
    (...params) => {
      const [set] = params;

      return {
        ...createUserInitialState(),
        ...createAccountSlice(...params),
        ...createSettingsSlice(...params),
        ...createWalletSlice(...params),
        ...createCefiUserAccountSlice(...params),

        hydrateLegacyReduxUserState: nextState => {
          set(state => mergeUserState(state, nextState));
        },

        resetUserState: () => {
          set(createUserInitialState());
        },
      };
    },
    {
      name: 'user-store',
      storage: createJSONStorage(() => userStoreStorage),
      partialize: state => ({
        account: state.account,
        settings: state.settings,
        wallet: state.wallet,
        cefiUserAccount: state.cefiUserAccount,
      }),
    },
  ),
);
