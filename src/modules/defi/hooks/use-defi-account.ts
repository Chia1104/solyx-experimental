import { useCallback, useMemo } from 'react';

import { getChainConfig } from '@/modules/chain/stores/chain-adapter/chains';
import { ChainType } from '@/modules/chain/stores/chain-adapter/types';
import { useQueryWallets } from '@/modules/database/hooks/use-query-wallets';
import { formatDefiRecordChainId } from '@/modules/database/utils/defi-record-chain-id';
import { useUserStore } from '@/modules/user/stores/user';
import type { WalletItem } from '@/modules/user/stores/user/types';

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
  const dbChainId = useMemo(
    () => (chainType != null ? formatDefiRecordChainId(chainType, currentChainId) : ''),
    [chainType, currentChainId],
  );

  const mnemonicWallets = useMemo(() => wallets.filter(item => !item.isImport), [wallets]);
  const privateKeyWallets = useMemo(() => wallets.filter(item => item.isImport), [wallets]);
  const sortedWallets = useMemo(
    () => [...mnemonicWallets, ...privateKeyWallets],
    [mnemonicWallets, privateKeyWallets],
  );

  const getAccountNameByAddress = useCallback(
    (targetAddress: string) => {
      const matchedWallet = sortedWallets.find(
        item =>
          item.evmAddress?.toLowerCase() === targetAddress.toLowerCase() ||
          item.tronAddress?.toLowerCase() === targetAddress.toLowerCase() ||
          item.liquidAmpId?.toLowerCase() === targetAddress.toLowerCase(),
      );

      return matchedWallet?.name ?? '';
    },
    [sortedWallets],
  );

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
    dbChainId,
    evmAddress,
    isEVM: chainType === ChainType.EVM,
    isLIQUID: chainType === ChainType.LIQUID,
    isTRON: chainType === ChainType.TRON,
    liquidAmpId,
    liquidSubaccountPointer,
    tronAddress,
    getAccountNameByAddress,
    mnemonicWallets,
    privateKeyWallets,
    sortedWallets,
    wallet,
    wallets,
  };
};
