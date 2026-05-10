import { useEffect } from 'react';

import { useQuery } from '@tanstack/react-query';
import { ActivityIndicator, View } from 'react-native';

import { LockScreenOverlay } from '@/components/lockscreen/lockscreen-overlay';
import { useGlobalStore } from '@/modules/app/stores/global';
import { useUserStore } from '@/modules/user/stores/user';

export default function AppLockIndex() {
  const hasActiveLockRequest = useGlobalStore(store => store.hasActiveLockRequest);
  const lockRequest = useGlobalStore(store => store.lockRequest);
  const requestLock = useGlobalStore(store => store.requestLock);
  const setStartup = useGlobalStore(store => store.setStartup);
  const setLoggedState = useUserStore(state => state.setLoggedState);

  const { isSuccess } = useQuery({
    enabled: !lockRequest && !hasActiveLockRequest(),
    gcTime: 0,
    queryFn: () =>
      requestLock({
        isDismissible: false,
        reason: 'Unlock your DeFi wallet to continue.',
        type: 'password',
      }),
    queryKey: ['app-lock', 'startup', lockRequest?.id ?? 'initial'],
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    retry: false,
    staleTime: Infinity,
  });

  useEffect(() => {
    if (!isSuccess) return;

    setStartup(true);
    setLoggedState(true);
  }, [isSuccess, setLoggedState, setStartup]);

  return (
    <View className="bg-background flex-1">
      {lockRequest ? (
        <LockScreenOverlay key={lockRequest.id} />
      ) : (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator />
        </View>
      )}
    </View>
  );
}
