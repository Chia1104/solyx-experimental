import { useQuery } from '@tanstack/react-query';

import { LockScreenOverlay } from '@/components/lockscreen/lockscreen-overlay';
import { Page } from '@/components/page';
import { useLockRequest } from '@/modules/app/hooks/use-lock-request';
import { useGlobalStore } from '@/modules/app/stores/global';
import { isLiquidChainId } from '@/modules/chain/hooks/use-liquid-session';
import { useUserStore } from '@/modules/user/stores/user';

export default function AppLockIndex() {
  const hasActiveLockRequest = useGlobalStore(store => store.hasActiveLockRequest);
  const lockRequest = useGlobalStore(store => store.lockRequest);
  const setStartup = useGlobalStore(store => store.setStartup);
  const currentChainId = useUserStore(state => state.wallet.currentChainId);
  const { requestLiquidUnlock, requestPassword } = useLockRequest();
  const isLiquidChain = isLiquidChainId(currentChainId);

  useQuery({
    enabled: !lockRequest && !hasActiveLockRequest(),
    gcTime: 0,
    queryFn: async () => {
      const result = isLiquidChain
        ? await requestLiquidUnlock({
            chainId: currentChainId,
            isDismissible: false,
            reason: 'Unlock your Liquid wallet to continue.',
          })
        : await requestPassword({
            isDismissible: false,
            reason: 'Unlock your DeFi wallet to continue.',
          });
      setStartup(true);
      return result;
    },
    queryKey: ['app-lock', 'startup', currentChainId, lockRequest?.id ?? 'initial'],
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    retry: false,
    staleTime: Infinity,
  });

  return lockRequest ? (
    <LockScreenOverlay key={lockRequest.id} />
  ) : (
    <Page isBrandVisible brandProps={{ display: ['brand', 'background'] }} />
  );
}
