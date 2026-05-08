import type { DefiAssetsActions, DefiAssetsState, UserStoreSlice } from './types';

export const createDefiAssetsInitialState = (): DefiAssetsState => ({
  assets: {},
  prices: {},
  balanceRefreshTrigger: 0,
});

export const createDefiAssetsSlice: UserStoreSlice<DefiAssetsActions> = set => ({
  setUserAssets: assets => {
    set(state => ({ defiAssets: { ...state.defiAssets, assets } }));
  },

  setTokenPrices: prices => {
    set(state => ({ defiAssets: { ...state.defiAssets, prices } }));
  },

  triggerBalanceRefresh: () => {
    set(state => ({ defiAssets: { ...state.defiAssets, balanceRefreshTrigger: Date.now() } }));
  },

  removeWalletAssets: address => {
    set(state => {
      const assets = Object.fromEntries(
        Object.entries(state.defiAssets.assets).map(([chainId, addressBalances]) => {
          const nextAddressBalances = { ...addressBalances };
          delete nextAddressBalances[address];
          return [chainId, nextAddressBalances];
        }),
      );

      return {
        defiAssets: {
          ...state.defiAssets,
          assets,
        },
      };
    });
  },
});
