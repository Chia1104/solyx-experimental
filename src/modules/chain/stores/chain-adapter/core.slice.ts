import type { JsonRpcProvider } from 'ethers';
import type { TronWeb } from 'tronweb';

import { createAdapterView } from './adapter-view';
import { EIP155_CHAINS, LIQUID_CHAINS, TRON_CHAINS } from './chains';
import type { TEIP155Chain, TLiquidChain, TTRONChain } from './chains';
import { ChainType } from './types';
import type { ChainAdapterSlice, CoreChainAdapterActions, CoreChainAdapterState } from './types';

export const createCoreChainAdapterInitialState = (): CoreChainAdapterState => ({
  adapters: new Map(),
  evmProviders: new Map<number, JsonRpcProvider>(),
  tronProviders: new Map<number, TronWeb>(),
  liquidGdk: null,
  liquidInitialized: false,
  liquidConnected: false,
  liquidLoggedIn: false,
  liquidSessionCreated: false,
  liquidNetworkNames: new Map(),
  liquidStaleSinceBackground: false,
});

export const createCoreChainAdapterSlice: ChainAdapterSlice<CoreChainAdapterActions> = (
  set,
  get,
) => ({
  getChainType: chainId => {
    if (EIP155_CHAINS[`eip155:${chainId}` as TEIP155Chain]) {
      return ChainType.EVM;
    }

    if (TRON_CHAINS[`${chainId}` as TTRONChain]) {
      return ChainType.TRON;
    }

    if (LIQUID_CHAINS[`${chainId}` as TLiquidChain]) {
      return ChainType.LIQUID;
    }

    throw new Error(`Unsupported chainId: ${chainId}`);
  },

  getAdapter: chainType => {
    const cachedAdapter = get().adapters.get(chainType);
    if (cachedAdapter) {
      return cachedAdapter;
    }

    const adapter = createAdapterView(get, chainType);
    set(state => ({
      adapters: new Map(state.adapters).set(chainType, adapter),
    }));
    return adapter;
  },

  getAdapterByChainId: chainId => {
    return get().getAdapter(get().getChainType(chainId));
  },

  getAllAdapters: () => {
    return [ChainType.EVM, ChainType.TRON, ChainType.LIQUID].map(chainType =>
      get().getAdapter(chainType),
    );
  },

  isChainTypeSupported: chainType => {
    try {
      get().getAdapter(chainType);
      return true;
    } catch {
      return false;
    }
  },

  isChainIdSupported: chainId => {
    try {
      get().getChainType(chainId);
      return true;
    } catch {
      return false;
    }
  },

  validateAddress: async ({ chainId, address, assetId }) => {
    if (!address || !get().isChainIdSupported(chainId)) {
      return false;
    }

    switch (get().getChainType(chainId)) {
      case ChainType.EVM:
        return get().isValidEvmAddress(address);
      case ChainType.TRON:
        return get().isValidTronAddress(address);
      case ChainType.LIQUID:
        if (!assetId) {
          return false;
        }
        try {
          return await get().validateLiquidAddress(address, assetId, chainId);
        } catch {
          return false;
        }
      default:
        return false;
    }
  },

  clearCache: () => {
    set({ adapters: new Map() });
  },

  clearProviderCache: chainType => {
    if (!chainType || chainType === ChainType.EVM) {
      set({ evmProviders: new Map() });
    }
    if (!chainType || chainType === ChainType.TRON) {
      set({ tronProviders: new Map() });
    }
    if (!chainType || chainType === ChainType.LIQUID) {
      set({ liquidNetworkNames: new Map() });
    }
  },
});
