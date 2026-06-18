import { useEffect } from 'react';

import { onlineManager } from '@tanstack/react-query';
import * as Network from 'expo-network';

/**
 * Bridges `expo-network` connectivity into React Query's {@link onlineManager}.
 *
 * Once wired, every `useQuery`/`useMutation` becomes network-aware for free:
 * - offline queries enter `fetchStatus: 'paused'` instead of firing and erroring
 * - they auto-resume + refetch when connectivity returns
 * - mutations expose `isPaused` and resume on reconnect
 *
 * The effect target is `onlineManager` (an external imperative manager), not
 * React state — so this is a legitimate `useEffect` subscription, not a
 * derived-state sync.
 *
 * Call once, high in the tree (see `RootProvider`).
 */
export const useOnlineManager = () => {
  useEffect(() => {
    Network.getNetworkStateAsync().then(state => {
      onlineManager.setOnline(!!state.isConnected);
    });

    const subscription = Network.addNetworkStateListener(state => {
      onlineManager.setOnline(!!state.isConnected);
    });

    return () => subscription.remove();
  }, []);
};
