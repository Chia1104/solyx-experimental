import { useCallback } from 'react';

import { useLiquidSession, isLiquidChainId } from '@/modules/chain/hooks/use-liquid-session';
import {
  EIP155_CHAINS,
  LIQUID_CHAINS,
  TRON_CHAINS,
} from '@/modules/chain/stores/chain-adapter/chains';
import { ChainType } from '@/modules/chain/stores/chain-adapter/types';
import { useQueryWallets } from '@/modules/database/hooks/use-query-wallets';
import { useUserStore } from '@/modules/user/stores/user';

const getDefaultChainIdForWallet = (chains: string[]) => {
  if (chains.includes(ChainType.EVM)) {
    return EIP155_CHAINS['eip155:1'].chainId;
  }

  if (chains.includes(ChainType.TRON)) {
    return Object.values(TRON_CHAINS)[0]?.chainId ?? 0;
  }

  if (chains.includes(ChainType.LIQUID)) {
    return Object.values(LIQUID_CHAINS)[0]?.chainId ?? 0;
  }

  return 0;
};

export const useChangeAccount = () => {
  const changeCurrentWalletId = useUserStore(state => state.changeCurrentWalletId);
  const changeNetwork = useUserStore(state => state.changeNetwork);
  const { ensureLiquidSession } = useLiquidSession();
  const { data: wallets = [] } = useQueryWallets();

  const changeAccount = useCallback(
    async (walletId: string) => {
      const wallet = wallets.find(item => item.id === walletId);
      if (!wallet) {
        return false;
      }

      const chainId = getDefaultChainIdForWallet(wallet.chains);
      if (!chainId) {
        return false;
      }

      if (isLiquidChainId(chainId)) {
        const isReady = await ensureLiquidSession(chainId);
        if (!isReady) {
          return false;
        }
      }

      changeNetwork(chainId);
      changeCurrentWalletId(walletId);

      return true;
    },
    [changeCurrentWalletId, changeNetwork, ensureLiquidSession, wallets],
  );

  return { changeAccount };
};
