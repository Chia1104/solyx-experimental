import { useState } from 'react';

import { useToast } from 'heroui-native';
import { useTranslation } from 'react-i18next';

import { FADE_IN_MS, useChainTransition } from '@/components/chain-transition';
import { useLiquidSession } from '@/modules/chain/hooks/use-liquid-session';
import {
  EIP155_CHAINS,
  LIQUID_CHAINS,
  TRON_CHAINS,
} from '@/modules/chain/stores/chain-adapter/chains';
import { ChainType } from '@/modules/chain/stores/chain-adapter/types';
import { useUserStore } from '@/modules/user/stores/user';
import { delay } from '@/utils/delay';

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

const CHAIN_SWITCH_TIMEOUT_MS = 10_000;

export const useSelectNetworkMode = (currentMode: NetworkMode) => {
  const { t } = useTranslation(['defi']);
  const { toast } = useToast();
  const [pendingMode, setPendingMode] = useState<NetworkMode | null>(null);
  const changeNetwork = useUserStore(state => state.changeNetwork);
  const { ensureLiquidSession } = useLiquidSession();
  const { beginTransition, endTransition } = useChainTransition();

  const selectNetworkMode = async (mode: NetworkMode) => {
    if (mode === currentMode || pendingMode) {
      return;
    }

    setPendingMode(mode);

    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    try {
      if (mode === 'private') {
        let rejectTimeout: ((err: Error) => void) | null = null;
        let transitionStarted = false;

        const timeoutPromise = new Promise<never>((_, reject) => {
          rejectTimeout = reject;
        });

        const sessionPromise = ensureLiquidSession(PRIVATE_CHAIN_ID, {
          onPasswordVerified: () => {
            transitionStarted = true;
            beginTransition();
            timeoutId = setTimeout(() => {
              rejectTimeout?.(new Error('timeout'));
            }, CHAIN_SWITCH_TIMEOUT_MS);
          },
        });

        const isReady = await Promise.race([sessionPromise, timeoutPromise]);

        if (timeoutId) clearTimeout(timeoutId);

        if (!isReady) {
          return;
        }

        if (!transitionStarted) {
          beginTransition();
          await delay(FADE_IN_MS);
        }

        changeNetwork(PRIVATE_CHAIN_ID);
        endTransition();
      } else {
        beginTransition();
        await delay(FADE_IN_MS);
        changeNetwork(PUBLIC_CHAIN_ID);
        endTransition();
      }
    } catch (err) {
      if (timeoutId) clearTimeout(timeoutId);
      endTransition();
      if (err instanceof Error && err.message === 'timeout') {
        toast.show({
          variant: 'danger',
          description: t('error.chain.switch.timeout'),
        });
      }
    } finally {
      setPendingMode(null);
    }
  };

  return { selectNetworkMode, pendingMode };
};
