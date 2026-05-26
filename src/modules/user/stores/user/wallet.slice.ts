import QuickCrypto from 'react-native-quick-crypto';

import type { UserStoreSlice, WalletActions, WalletState } from './types';

export const createWalletInitialState = (): WalletState => ({
  namespace: 'eip155',
  currentChainId: 1,
  currentWalletId: '',
  wallets: [],
});

export const createWalletSlice: UserStoreSlice<WalletActions> = set => ({
  changeNamespace: namespace => {
    set(state => ({ wallet: { ...state.wallet, namespace } }));
  },

  changeNetwork: chainId => {
    set(state => ({ wallet: { ...state.wallet, currentChainId: chainId } }));
  },

  addWallet: wallet => {
    const newWallet = {
      id: QuickCrypto.randomUUID(),
      ...wallet,
    };
    set(state => ({ wallet: { ...state.wallet, wallets: [...state.wallet.wallets, newWallet] } }));
  },

  setWalletInfo: walletInfo => {
    set(state => ({
      wallet: {
        ...state.wallet,
        wallets: state.wallet.wallets.map(wallet => {
          const isTargetWallet =
            wallet.evmAddress === walletInfo.address ||
            wallet.tronAddress === walletInfo.address ||
            wallet.liquidAmpId === walletInfo.address;

          if (!isTargetWallet) {
            return wallet;
          }

          return {
            ...wallet,
            image: walletInfo.image,
            name: walletInfo.name,
          };
        }),
      },
    }));
  },

  changeCurrentWalletId: id => {
    set(state => ({ wallet: { ...state.wallet, currentWalletId: id } }));
  },

  deleteWallet: address => {
    set(state => ({
      wallet: {
        ...state.wallet,
        wallets: state.wallet.wallets.filter(wallet => {
          return (
            wallet.evmAddress !== address &&
            wallet.tronAddress !== address &&
            wallet.liquidAmpId !== address
          );
        }),
      },
    }));
  },

  resetWallet: () => {
    set(state => ({
      wallet: {
        ...state.wallet,
        wallets: [],
        currentWalletId: '',
      },
    }));
  },
});
