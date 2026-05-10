import type { AccountActions, AccountState, UserStoreSlice } from './types';

export const createAccountInitialState = (): AccountState => ({
  hasPassword: false,
  hasHDWallet: false,
  backupPhraseState: '',
  account: '',
});

export const createAccountSlice: UserStoreSlice<AccountActions> = set => ({
  setHasPassword: hasPassword => {
    set(state => ({ account: { ...state.account, hasPassword } }));
  },

  setHasHDWallet: hasHDWallet => {
    set(state => ({ account: { ...state.account, hasHDWallet } }));
  },

  setBackupPhraseState: backupPhraseState => {
    set(state => ({ account: { ...state.account, backupPhraseState } }));
  },

  setAccount: account => {
    set(state => ({ account: { ...state.account, account } }));
  },

  resetAccount: () => {
    set(state => ({
      account: {
        ...state.account,
        hasPassword: false,
        hasHDWallet: false,
        backupPhraseState: '',
      },
    }));
  },
});
