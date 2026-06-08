import { useCallback, useEffect, useRef } from 'react';

import { useTranslation } from 'react-i18next';
import { AppState } from 'react-native';

import { useLockRequest } from '@/modules/app/hooks/use-lock-request';
import { useGlobalStore } from '@/modules/app/stores/global';
import { useUserStore } from '@/modules/user/stores/user';

import type {
  LiquidLifecycleEvent,
  LiquidLifecycleState,
  LiquidSessionAction,
} from '../lib/liquid-session-policy';
import { initialLiquidLifecycleState, reduceLiquidLifecycle } from '../lib/liquid-session-policy';
import { useChainAdapterStore } from '../stores/chain-adapter';
import type { TLiquidChain } from '../stores/chain-adapter/chains';
import { LIQUID_CHAINS } from '../stores/chain-adapter/chains';

export { LIQUID_SESSION_TIMEOUT_MS } from '../lib/liquid-session-policy';

export const isLiquidChainId = (chainId: number) =>
  Boolean(LIQUID_CHAINS[`${chainId}` as TLiquidChain]);

export const useLiquidSession = () => {
  const { t } = useTranslation(['global']);
  const { requestLiquidUnlock } = useLockRequest();
  const hasActiveLockRequest = useGlobalStore(state => state.hasActiveLockRequest);

  const isLiquidSessionUsable = useChainAdapterStore(state => state.isLiquidSessionUsable);
  const destroyLiquidSession = useChainAdapterStore(state => state.destroyLiquidSession);
  const pendingLiquidSessionRef = useRef<Promise<boolean> | null>(null);

  const ensureLiquidSession = useCallback(
    async (chainId: number, options?: { onPasswordVerified?: () => void }) => {
      if (!isLiquidChainId(chainId)) {
        return true;
      }

      if (isLiquidSessionUsable()) {
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
    [requestLiquidUnlock, hasActiveLockRequest, destroyLiquidSession, isLiquidSessionUsable, t],
  );

  return { ensureLiquidSession };
};

export const LiquidSessionInterceptor = () => {
  const currentChainId = useUserStore(state => state.wallet.currentChainId);
  const { ensureLiquidSession } = useLiquidSession();

  const lifecycleRef = useRef<LiquidLifecycleState>(initialLiquidLifecycleState);
  const currentChainIdRef = useRef(currentChainId);
  const ensureLiquidSessionRef = useRef(ensureLiquidSession);

  const destroyLiquidSession = useChainAdapterStore(state => state.destroyLiquidSession);
  const tryReconnect = useChainAdapterStore(state => state.tryReconnect);
  const markLiquidSessionStale = useChainAdapterStore(state => state.markLiquidSessionStale);
  const liquidGdk = useChainAdapterStore(state => state.liquidGdk);
  const liquidLoggedIn = useChainAdapterStore(state => state.liquidLoggedIn);

  const handleDestroyLiquidSession = useCallback(
    async (reconnect = true) => {
      try {
        await destroyLiquidSession();
        if (reconnect) {
          await ensureLiquidSessionRef.current(currentChainIdRef.current);
        }
      } catch {
        // The user may dismiss the Liquid unlock request; keep the app running and retry on next access.
      }
    },
    [destroyLiquidSession],
  );

  // Restore the socket without prompting. `tryReconnect` confirms the login survived; only if it's
  // truly gone do we tear down and force a re-unlock (silent re-login isn't possible — deriving the
  // mnemonic requires the password).
  const reconnectOrUnlock = useCallback(async () => {
    const ok = await tryReconnect(currentChainIdRef.current);
    if (!ok) {
      await handleDestroyLiquidSession();
    }
  }, [tryReconnect, handleDestroyLiquidSession]);

  const runAction = useCallback(
    (action: LiquidSessionAction) => {
      switch (action) {
        case 'reconnect':
          void reconnectOrUnlock();
          break;
        case 'reverify':
          void handleDestroyLiquidSession();
          break;
        case 'markStale':
          // Off-Liquid background: don't tear down now (skips the native destroy); just mark the
          // session stale so the next Liquid access re-verifies. No prompt fires off Liquid.
          markLiquidSessionStale();
          break;
        case 'none':
          break;
      }
    },
    [reconnectOrUnlock, handleDestroyLiquidSession, markLiquidSessionStale],
  );

  const dispatch = useCallback(
    (event: LiquidLifecycleEvent) => {
      const { state, action } = reduceLiquidLifecycle(lifecycleRef.current, event);
      lifecycleRef.current = state;
      runAction(action);
    },
    [runAction],
  );

  currentChainIdRef.current = currentChainId;
  ensureLiquidSessionRef.current = ensureLiquidSession;

  // Clean up an unverified/half-open session when leaving Liquid. A verified session is kept so a
  // pure foreground switch back to Liquid is instant; a background while off Liquid is handled by
  // the AppState dispatch marking it stale. Keyed on the chain id (not `liquidGdk`) so the session
  // created mid-switch — gdk is set during login, before `changeNetwork` — isn't destroyed early.
  useEffect(() => {
    if (!isLiquidChainId(currentChainId) && !liquidLoggedIn) {
      handleDestroyLiquidSession(false);
    }
  }, [currentChainId, liquidLoggedIn, handleDestroyLiquidSession]);

  // Network listener needs the gdk instance, so it re-attaches when `liquidGdk` changes — but only
  // while on Liquid. It never decides teardown itself; it defers to the reducer.
  useEffect(() => {
    if (!isLiquidChainId(currentChainId) || !liquidGdk) {
      return;
    }

    liquidGdk.addListener('network', ({ network }) => {
      if (network.current_state !== 'disconnected') {
        return;
      }
      dispatch({ type: 'networkDisconnected', now: Date.now() });
    });

    return () => {
      liquidGdk.removeListener('network');
    };
  }, [dispatch, currentChainId, liquidGdk]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextState => {
      if (nextState === 'background' || nextState === 'inactive') {
        dispatch({ type: 'background', now: Date.now() });
        return;
      }
      if (nextState === 'active') {
        dispatch({
          type: 'foreground',
          now: Date.now(),
          isOnLiquid: isLiquidChainId(currentChainIdRef.current),
        });
      }
    });

    return () => {
      subscription.remove();
    };
  }, [dispatch]);

  return null;
};
