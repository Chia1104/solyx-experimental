import { useMemo } from 'react';

import {
  EIP155_CHAINS,
  LIQUID_CHAINS,
  TRON_CHAINS,
} from '@/modules/chain/stores/chain-adapter/chains';
import type { ChainConfigMap } from '@/modules/chain/stores/chain-adapter/types';
import { ChainType } from '@/modules/chain/stores/chain-adapter/types';
import { useQueryWallets } from '@/modules/database/hooks/use-query-wallets';
import { useUserStore } from '@/modules/user/stores/user';
import type { WalletItem } from '@/modules/user/stores/user/types';

const chainConfigs: ChainConfigMap = {
  ...EIP155_CHAINS,
  ...TRON_CHAINS,
  ...LIQUID_CHAINS,
};

export const getChainConfig = (chainId: number) =>
  Object.values(chainConfigs).find(chain => chain.chainId === chainId);

export const getWalletAddress = (wallet: WalletItem | undefined, chainType: ChainType) => {
  if (!wallet) {
    return '';
  }
  switch (chainType) {
    case ChainType.EVM:
      return wallet.evmAddress ?? '';
    case ChainType.TRON:
      return wallet.tronAddress ?? '';
    case ChainType.LIQUID:
      return wallet.liquidAmpId ?? '';
    default:
      return '';
  }
};

export const useDefiAccount = () => {
  const currentChainId = useUserStore(state => state.wallet.currentChainId);
  const currentWalletId = useUserStore(state => state.wallet.currentWalletId);
  const { data: wallets = [] } = useQueryWallets();

  const chain = useMemo(() => getChainConfig(currentChainId), [currentChainId]);
  const wallet = useMemo(
    () => wallets.find(item => item.id === currentWalletId),
    [currentWalletId, wallets],
  );

  const chainType = chain?.chainType;
  const evmAddress = wallet?.evmAddress ?? '';
  const tronAddress = wallet?.tronAddress ?? '';
  const liquidAmpId = wallet?.liquidAmpId ?? '';
  const liquidSubaccountPointer = wallet?.liquidSubaccountPointer;
  const currentAddress = getWalletAddress(wallet, chainType ?? ChainType.EVM);

  return {
    addresses: {
      evm: evmAddress,
      liquid: liquidAmpId,
      tron: tronAddress,
    },
    chain,
    chainType,
    currentAddress,
    currentChainId,
    currentWalletId,
    evmAddress,
    isEVM: chainType === ChainType.EVM,
    isLIQUID: chainType === ChainType.LIQUID,
    isTRON: chainType === ChainType.TRON,
    liquidAmpId,
    liquidSubaccountPointer,
    tronAddress,
    wallet,
    wallets,
  };
};
