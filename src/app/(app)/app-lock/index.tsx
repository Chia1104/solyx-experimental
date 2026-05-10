import { useQuery } from '@tanstack/react-query';

import Brand from '@/components/brand';
import { LockScreenOverlay } from '@/components/lockscreen/lockscreen-overlay';
import { useGlobalStore } from '@/modules/app/stores/global';

export default function AppLockIndex() {
  const hasActiveLockRequest = useGlobalStore(store => store.hasActiveLockRequest);
  const lockRequest = useGlobalStore(store => store.lockRequest);
  const requestLock = useGlobalStore(store => store.requestLock);
  const setStartup = useGlobalStore(store => store.setStartup);

  useQuery({
    enabled: !lockRequest && !hasActiveLockRequest(),
    gcTime: 0,
    queryFn: async () => {
      const result = await requestLock({
        isDismissible: false,
        reason: 'Unlock your DeFi wallet to continue.',
        type: 'password',
      });
      setStartup(true);
      return result;
    },
    queryKey: ['app-lock', 'startup', lockRequest?.id ?? 'initial'],
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    retry: false,
    staleTime: Infinity,
  });

  return lockRequest ? <LockScreenOverlay key={lockRequest.id} /> : <Brand />;
}
