import { useCallback, useEffect, useRef } from 'react';

import { useTranslation } from 'react-i18next';
import { AppState } from 'react-native';

import { useLockRequest } from '@/modules/app/hooks/use-lock-request';
import { useGlobalStore } from '@/modules/app/stores/global';
import { useUserStore } from '@/modules/user/stores/user';

import { useChainAdapterStore } from '../stores/chain-adapter';
import type { TLiquidChain } from '../stores/chain-adapter/chains';
import { LIQUID_CHAINS } from '../stores/chain-adapter/chains';

const LIQUID_SESSION_TIMEOUT_MS = 30_000;

export const isLiquidChainId = (chainId: number) =>
  Boolean(LIQUID_CHAINS[`${chainId}` as TLiquidChain]);

export const useLiquidSession = () => {
  const { t } = useTranslation(['global']);
  const { requestLiquidUnlock } = useLockRequest();
  const hasActiveLockRequest = useGlobalStore(state => state.hasActiveLockRequest);

  const checkLiquidProviderReady = useChainAdapterStore(state => state.checkLiquidProviderReady);
  const destroyLiquidSession = useChainAdapterStore(state => state.destroyLiquidSession);
  const pendingLiquidSessionRef = useRef<Promise<boolean> | null>(null);

  const ensureLiquidSession = useCallback(
    async (chainId: number, options?: { onPasswordVerified?: () => void }) => {
      if (!isLiquidChainId(chainId)) {
        return true;
      }

      const isReady = await checkLiquidProviderReady(chainId);
      if (isReady) {
        return true;
      }

      if (pendingLiquidSessionRef.current) {
        return pendingLiquidSessionRef.current;
      }

      if (hasActiveLockRequest()) {
        return false;
      }

      pendingLiquidSessionRef.current = (async () => {
        await destroyLiquidSession();
        await requestLiquidUnlock({
          chainId,
          isDismissible: false,
          reason: t('description.unlock.liquid.wallet'),
          onPasswordVerified: options?.onPasswordVerified,
        });

        return true;
      })().finally(() => {
        pendingLiquidSessionRef.current = null;
      });

      return pendingLiquidSessionRef.current;
    },
    [requestLiquidUnlock, hasActiveLockRequest, destroyLiquidSession, checkLiquidProviderReady, t],
  );

  return { ensureLiquidSession };
};

export const LiquidSessionInterceptor = () => {
  const currentChainId = useUserStore(state => state.wallet.currentChainId);
  const { ensureLiquidSession } = useLiquidSession();
  const backgroundedAtRef = useRef<number | null>(null);
  const currentChainIdRef = useRef(currentChainId);
  const ensureLiquidSessionRef = useRef(ensureLiquidSession);

  const destroyLiquidSession = useChainAdapterStore(state => state.destroyLiquidSession);

  const handleDestroyLiquidSession = useCallback(async () => {
    try {
      await destroyLiquidSession();
      await ensureLiquidSessionRef.current(currentChainIdRef.current);
    } catch {
      // The user may dismiss the Liquid unlock request; keep the app running and retry on next access.
    }
  }, [destroyLiquidSession]);

  currentChainIdRef.current = currentChainId;
  ensureLiquidSessionRef.current = ensureLiquidSession;

  useEffect(() => {
    if (!isLiquidChainId(currentChainId)) {
      return;
    }

    ensureLiquidSession(currentChainId);
  }, [currentChainId, ensureLiquidSession]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextState => {
      const isBackground = nextState === 'background' || nextState === 'inactive';

      if (isBackground) {
        backgroundedAtRef.current = Date.now();
        return;
      }

      if (nextState !== 'active') {
        return;
      }

      const backgroundedAt = backgroundedAtRef.current;
      backgroundedAtRef.current = null;

      if (!backgroundedAt || Date.now() - backgroundedAt < LIQUID_SESSION_TIMEOUT_MS) {
        return;
      }

      handleDestroyLiquidSession();
    });

    return () => {
      subscription.remove();
    };
  }, [handleDestroyLiquidSession]);

  return null;
};
