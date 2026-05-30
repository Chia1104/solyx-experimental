import { ChainType } from '@/modules/chain/stores/chain-adapter/types';

export const formatDefiRecordChainId = (chainType: ChainType, chainId: number) => {
  switch (chainType) {
    case ChainType.EVM:
      return `eip155:${chainId}`;
    case ChainType.LIQUID:
      return `liquid:${chainId}`;
    case ChainType.TRON:
      return chainId.toString();
    default:
      return chainId.toString();
  }
};
