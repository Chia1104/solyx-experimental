import {
  EIP155_CHAINS,
  LIQUID_CHAINS,
  TRON_CHAINS,
} from '@/modules/chain/stores/chain-adapter/chains';
import { ChainType } from '@/modules/chain/stores/chain-adapter/types';

export const PUBLIC_CHAIN_ID = EIP155_CHAINS['eip155:1'].chainId;
export const PRIVATE_CHAIN_ID = LIQUID_CHAINS['1776'].chainId;

export const PUBLIC_CHAINS = [...Object.values(EIP155_CHAINS), ...Object.values(TRON_CHAINS)];
export const PRIVATE_CHAINS = Object.values(LIQUID_CHAINS);

export type NetworkMode = 'public' | 'private';

export const getNetworkMode = (chainType?: ChainType): NetworkMode =>
  chainType === ChainType.LIQUID ? 'private' : 'public';

export const getModeChains = (mode: NetworkMode, walletChains?: string[]) => {
  const chains = mode === 'private' ? PRIVATE_CHAINS : PUBLIC_CHAINS;

  if (!walletChains?.length) {
    return chains;
  }

  return chains.filter(chain => walletChains.includes(chain.chainType));
};
