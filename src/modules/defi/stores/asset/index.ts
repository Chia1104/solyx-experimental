import { createMMKV } from 'react-native-mmkv';
import { create } from 'zustand';
import type { StateStorage } from 'zustand/middleware';
import { createJSONStorage, persist } from 'zustand/middleware';

const assetStoreMMKV = createMMKV({
  id: 'asset-store',
});

const assetStoreStorage: StateStorage = {
  getItem: name => assetStoreMMKV.getString(name) ?? null,
  setItem: (name, value) => {
    assetStoreMMKV.set(name, value);
  },
  removeItem: name => {
    assetStoreMMKV.remove(name);
  },
};

export interface AssetState {
  isBalanceVisible: boolean;
}

export interface AssetActions {
  setBalanceVisible: (isBalanceVisible: boolean) => void;
  toggleBalanceVisibility: () => void;
}

export type AssetStore = AssetState & AssetActions;

export const createAssetInitialState = (): AssetState => ({
  isBalanceVisible: false,
});

export const useAssetStore = create<AssetStore>()(
  persist(
    set => ({
      ...createAssetInitialState(),

      setBalanceVisible: isBalanceVisible => {
        set({ isBalanceVisible });
      },

      toggleBalanceVisibility: () => {
        set(state => ({ isBalanceVisible: !state.isBalanceVisible }));
      },
    }),
    {
      name: 'asset-store',
      storage: createJSONStorage(() => assetStoreStorage),
      partialize: state => ({
        isBalanceVisible: state.isBalanceVisible,
      }),
    },
  ),
);
