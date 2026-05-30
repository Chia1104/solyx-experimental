import type { UserStoreSlice, WalletPreferenceActions, WalletPreferenceState } from './types';

export const createWalletInitialState = (): WalletPreferenceState => ({
  namespace: 'eip155',
  currentChainId: 1,
  currentWalletId: '',
});

export const createWalletSlice: UserStoreSlice<WalletPreferenceActions> = set => ({
  changeNamespace: namespace => {
    set(state => ({ wallet: { ...state.wallet, namespace } }));
  },

  changeNetwork: chainId => {
    set(state => ({ wallet: { ...state.wallet, currentChainId: chainId } }));
  },

  changeCurrentWalletId: id => {
    set(state => ({ wallet: { ...state.wallet, currentWalletId: id } }));
  },

  resetWalletPreference: () => {
    set(state => ({
      wallet: {
        ...state.wallet,
        currentWalletId: '',
      },
    }));
  },
});
