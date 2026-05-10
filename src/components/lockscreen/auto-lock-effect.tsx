import { useEffect, useEffectEvent, useRef } from 'react';

import { useTranslation } from 'react-i18next';
import type { AppStateStatus } from 'react-native';
import { AppState } from 'react-native';

import { env } from '@/libs/env';
import { useGlobalStore } from '@/modules/app/stores/global';
import { hasKeychainGenericPassword } from '@/modules/keychain/utils';
import { useUserStore } from '@/modules/user/stores/user';

const AUTO_LOCK_BACKGROUND_TIMEOUT_MS = 30_000;

export const AutoLockEffect = () => {
  const { t } = useTranslation(['global']);
  const hasActiveRequest = useGlobalStore(store => store.hasActiveLockRequest);
  const requestLock = useGlobalStore(store => store.requestLock);
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

        void requestLock({
          isDismissible: false,
          reason: t('description.verify.app.lock'),
          type: 'password',
        }).catch(() => {
          /* Another request may have won the race while returning to foreground. */
        });
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
