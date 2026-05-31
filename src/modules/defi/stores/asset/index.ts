import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { assetStoreKv, createZustandKvStorage } from '@/modules/kv';

const assetStoreStorage = createZustandKvStorage(assetStoreKv);

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
