import { create } from 'zustand';

import { createCoreChainAdapterInitialState, createCoreChainAdapterSlice } from './core.slice';
import { createEvmChainAdapterSlice } from './evm.slice';
import { createLiquidChainAdapterSlice } from './liquid.slice';
import { createTronChainAdapterSlice } from './tron.slice';
import type { ChainAdapterState } from './types';

export const useChainAdapterStore = create<ChainAdapterState>((...params) => ({
  ...createCoreChainAdapterInitialState(),
  ...createCoreChainAdapterSlice(...params),
  ...createEvmChainAdapterSlice(...params),
  ...createTronChainAdapterSlice(...params),
  ...createLiquidChainAdapterSlice(...params),
}));
