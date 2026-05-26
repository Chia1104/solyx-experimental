import Crypto from 'react-native-quick-crypto';
import { create } from 'zustand';

import type { LockRequest, LockRequestInput } from '@/modules/app/types/log-request.type';
import { LockScreenError, LockScreenErrorCode } from '@/modules/app/types/log-request.type';
import type { SupportedNetwork } from '@/modules/chain/enums/supported-chain.enum';
import { deferToNextFrame } from '@/utils/delay';

interface PendingLockResolver {
  id: string;
  reject: (reason?: Error) => void;
  resolve: (verifiedPassword: string) => void;
}

export interface GlobalState {
  isStartupDone: boolean;
  lockRequest: LockRequest | null;
  network?: SupportedNetwork;
  isLoading?: boolean;
}

export interface GlobalActions {
  hasActiveLockRequest: () => boolean;
  rejectLockVerification: (error?: Error) => void;
  requestLockVerification: (request: LockRequestInput) => Promise<string>;
  resolveLockVerification: (request: LockRequest, verifiedPassword: string) => void;
  setStartup: (isStartupDone: boolean) => void;
  setNetwork: (network?: SupportedNetwork) => void;
  setLoading: (isLoading?: boolean) => void;
  resetGlobalState: () => void;
}

export type GlobalStoreState = GlobalState & GlobalActions;

export const createGlobalInitialState = (): GlobalState => ({
  isStartupDone: false,
  lockRequest: null,
  network: undefined,
  isLoading: false,
});

export const useGlobalStore = create<GlobalStoreState>()((set, get) => {
  let pendingLockResolver: PendingLockResolver | null = null;

  const clearLockRequest = () => {
    pendingLockResolver = null;
    set({ lockRequest: null });
  };

  return {
    ...createGlobalInitialState(),

    hasActiveLockRequest: () => Boolean(get().lockRequest || pendingLockResolver),

    rejectLockVerification: error => {
      const resolver = pendingLockResolver;

      if (!resolver) return;

      clearLockRequest();
      resolver.reject(error ?? new LockScreenError(LockScreenErrorCode.Canceled));
    },

    requestLockVerification: input => {
      if (get().lockRequest || pendingLockResolver) {
        return Promise.reject(
          new LockScreenError(LockScreenErrorCode.RequestInProgress, 'Lock request already active'),
        );
      }

      const nextRequest = {
        ...input,
        id: Crypto.randomUUID(),
      };

      set({ lockRequest: nextRequest });

      return new Promise<string>((resolve, reject) => {
        pendingLockResolver = {
          id: nextRequest.id,
          reject,
          resolve,
        };
      });
    },

    resolveLockVerification: (resolvedRequest, verifiedPassword) => {
      const resolver = pendingLockResolver;

      if (!resolver || resolver.id !== resolvedRequest.id) return;

      clearLockRequest();
      void deferToNextFrame().then(() => {
        resolver.resolve(verifiedPassword);
      });
    },

    setStartup: isStartupDone => {
      set({ isStartupDone });
    },

    setNetwork: network => {
      set({ network });
    },

    setLoading: isLoading => {
      set({ isLoading });
    },

    resetGlobalState: () => {
      const resolver = pendingLockResolver;

      pendingLockResolver = null;
      set(createGlobalInitialState());

      resolver?.reject(new LockScreenError(LockScreenErrorCode.Canceled));
    },
  };
});
