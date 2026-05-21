import QuickCrypto from 'react-native-quick-crypto';

import type { UserStoreSlice, WalletActions, WalletState } from './types';

export const createWalletInitialState = (): WalletState => ({
  namespace: 'eip155',
  currentChainId: 1,
  currentWalletIndex: 0,
  currentWalletId: '',
  wallets: [],
  walletConnectPaireds: {},
  dappsConnected: {},
});

export const createWalletSlice: UserStoreSlice<WalletActions> = set => ({
  connectDapp: dappData => {
    const url = new URL(dappData.url);
    set(state => ({
      wallet: {
        ...state.wallet,
        dappsConnected: {
          ...state.wallet.dappsConnected,
          [url.hostname]: dappData,
        },
      },
    }));
  },

  disconnectDappAccount: (address, hostname) => {
    set(state => {
      const dappData = state.wallet.dappsConnected[hostname];
      if (!dappData) {
        return {};
      }

      return {
        wallet: {
          ...state.wallet,
          dappsConnected: {
            ...state.wallet.dappsConnected,
            [hostname]: {
              ...dappData,
              accounts: dappData.accounts.filter(account => account !== address),
            },
          },
        },
      };
    });
  },

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

  // changeCurrentWalletIndex: index => {
  //   set(state => ({ wallet: { ...state.wallet, currentWalletIndex: index } }));
  // },

  changeCurrentWalletId: id => {
    set(state => ({ wallet: { ...state.wallet, currentWalletId: id } }));
  },

  addWalletConnectPaired: (address, pairedProposal) => {
    set(state => ({
      wallet: {
        ...state.wallet,
        walletConnectPaireds: {
          ...state.wallet.walletConnectPaireds,
          [address]: [...(state.wallet.walletConnectPaireds[address] ?? []), pairedProposal],
        },
      },
    }));
  },

  removeWalletConnectPaired: (address, pairingTopic) => {
    set(state => ({
      wallet: {
        ...state.wallet,
        walletConnectPaireds: {
          ...state.wallet.walletConnectPaireds,
          [address]: (state.wallet.walletConnectPaireds[address] ?? []).filter(item => {
            const proposal = item as { params?: { pairingTopic?: string } };
            return proposal.params?.pairingTopic !== pairingTopic;
          }),
        },
      },
    }));
  },

  removeAllWalletConnectPaired: () => {
    set(state => ({ wallet: { ...state.wallet, walletConnectPaireds: {} } }));
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
        walletConnectPaireds: {},
        wallets: [],
        currentWalletIndex: 0,
      },
    }));
  },
});
