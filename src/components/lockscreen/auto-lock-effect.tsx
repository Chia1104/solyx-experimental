import { useEffect, useEffectEvent, useRef } from 'react';

import type { AppStateStatus } from 'react-native';
import { AppState } from 'react-native';

import { env } from '@/libs/env';
import { useGlobalStore } from '@/modules/app/stores/global';
import { hasKeychainGenericPassword } from '@/modules/keychain/utils';
import { useUserStore } from '@/modules/user/stores/user';

const AUTO_LOCK_BACKGROUND_TIMEOUT_MS = 30_000;

export const AutoLockEffect = () => {
  const hasActiveRequest = useGlobalStore(store => store.hasActiveLockRequest);
  const setStartup = useGlobalStore(store => store.setStartup);
  const autoLock = useUserStore(state => state.settings.autoLock);
  const hasPassword = useUserStore(state => state.account.hasPassword);

  const lastBackgroundAtRef = useRef<number | null>(null);

  const handleAppStateChange = useEffectEvent((nextState: AppStateStatus) => {
    const isBackground = nextState === 'background' || nextState === 'inactive';

    if (isBackground) {
      lastBackgroundAtRef.current = Date.now();
      return;
    }

    if (nextState !== 'active') return;

    const backgroundAt = lastBackgroundAtRef.current;
    lastBackgroundAtRef.current = null;

    if (!backgroundAt) return;

    const elapsed = Date.now() - backgroundAt;

    if (
      !autoLock ||
      !hasPassword ||
      hasActiveRequest() ||
      elapsed < AUTO_LOCK_BACKGROUND_TIMEOUT_MS
    ) {
      return;
    }

    void hasKeychainGenericPassword(env.EXPO_PUBLIC_WALLET_DEFI_PASSWORD_SERVICE).then(
      hasCredential => {
        if (!hasCredential || hasActiveRequest()) return;

        setStartup(false);
      },
    );
  });

  useEffect(() => {
    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription.remove();
    };
  }, []);

  return null;
};
