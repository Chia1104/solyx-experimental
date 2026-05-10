import Crypto from 'react-native-quick-crypto';
import { create } from 'zustand';

import type { LockRequestType } from '@/modules/app/enums/lock-request-type.enum';
import type {
  LockRequest,
  LockRequestInput,
  LockRequestResult,
  LockRequestResultMap,
} from '@/modules/app/types/log-request.type';
import { LockScreenError, LockScreenErrorCode } from '@/modules/app/types/log-request.type';
import type { SupportedNetwork } from '@/modules/chain/enums/supported-chain.enum';

interface PendingLockResolver {
  id: string;
  reject: (reason?: Error) => void;
  resolve: (value: LockRequestResultMap[LockRequestType]) => void;
}

let activeLockRequest: LockRequest | null = null;
let pendingLockResolver: PendingLockResolver | null = null;

export interface GlobalState {
  /** App 啟動後是否已完成必要的 app-lock 驗證。 */
  isStartupDone: boolean;
  lockRequest: LockRequest | null;
  network?: SupportedNetwork;
  isLoading?: boolean;
  /** 暫時不觸發應用鎖直到此時間戳（用於拍照/選圖等離開 app 的流程） */
  appLockSuppressUntil?: number | null;
  /** 進入背景時的時間戳，用於 30 秒內回前景不要求解鎖 */
  appBackgroundedAt?: number | null;
  /** 僅因背景逾時清除 Liquid session，此次回前景不觸發 app lock，只解 Liquid */
  liquidSessionDestroyedByBackground?: boolean;
  /** 使用者從 FGS 點「鎖定錢包」等：在此之前勿用 getPassword() 蓋掉 liquid lock（時間戳 ms）。 */
  liquidFgsSuppressResumePasswordLockUntil?: number | null;
}

export interface GlobalActions {
  hasActiveLockRequest: () => boolean;
  rejectLockRequest: (error?: Error) => void;
  requestLock: <T extends LockRequestType>(
    request: Extract<LockRequestInput, { type: T }>,
  ) => Promise<LockRequestResult<T>>;
  resolveLockRequest: (request: LockRequest, result: LockRequestResultMap[LockRequestType]) => void;
  setStartup: (isStartupDone: boolean) => void;
  setLockRequest: (lockRequest?: LockRequest) => void;
  setNetwork: (network?: SupportedNetwork) => void;
  setLoading: (isLoading?: boolean) => void;
  setAppLockSuppressUntil: (appLockSuppressUntil?: number | null) => void;
  setAppBackgroundedAt: (appBackgroundedAt?: number | null) => void;
  setLiquidSessionDestroyedByBackground: (destroyed?: boolean) => void;
  setLiquidFgsSuppressResumePasswordLockUntil: (suppressUntil?: number | null) => void;
  resetGlobalState: () => void;
}

export type GlobalStoreState = GlobalState & GlobalActions;

export const createGlobalInitialState = (): GlobalState => ({
  isStartupDone: false,
  lockRequest: null,
  network: undefined,
  isLoading: false,
  appLockSuppressUntil: null,
  appBackgroundedAt: null,
  liquidSessionDestroyedByBackground: false,
  liquidFgsSuppressResumePasswordLockUntil: null,
});

export const useGlobalStore = create<GlobalStoreState>()(set => ({
  ...createGlobalInitialState(),

  hasActiveLockRequest: () => Boolean(activeLockRequest),

  rejectLockRequest: error => {
    const resolver = pendingLockResolver;

    if (!resolver) return;

    activeLockRequest = null;
    pendingLockResolver = null;
    set({ lockRequest: null });
    resolver.reject(error ?? new LockScreenError(LockScreenErrorCode.Canceled));
  },

  requestLock: <T extends LockRequestType>(input: Extract<LockRequestInput, { type: T }>) => {
    if (activeLockRequest || pendingLockResolver) {
      return Promise.reject(
        new LockScreenError(LockScreenErrorCode.RequestInProgress, 'Lock request already active'),
      );
    }

    const nextRequest = {
      ...input,
      id: Crypto.randomUUID(),
    } as Extract<LockRequest, { type: T }>;

    activeLockRequest = nextRequest;
    set({ lockRequest: nextRequest });

    return new Promise<LockRequestResult<T>>((resolve, reject) => {
      pendingLockResolver = {
        id: nextRequest.id,
        reject,
        resolve: value => {
          resolve(value as LockRequestResult<T>);
        },
      };
    });
  },

  resolveLockRequest: (resolvedRequest, result) => {
    const resolver = pendingLockResolver;

    if (!resolver || resolver.id !== resolvedRequest.id) return;

    activeLockRequest = null;
    pendingLockResolver = null;
    set({ lockRequest: null });
    resolver.resolve(result);
  },

  setStartup: isStartupDone => {
    set({ isStartupDone });
  },

  setLockRequest: lockRequest => {
    activeLockRequest = lockRequest ?? null;
    set({ lockRequest: lockRequest ?? null });
  },

  setNetwork: network => {
    set({ network });
  },

  setLoading: isLoading => {
    set({ isLoading });
  },

  setAppLockSuppressUntil: appLockSuppressUntil => {
    set({ appLockSuppressUntil: appLockSuppressUntil ?? null });
  },

  setAppBackgroundedAt: appBackgroundedAt => {
    set({ appBackgroundedAt: appBackgroundedAt ?? null });
  },

  setLiquidSessionDestroyedByBackground: destroyed => {
    set({ liquidSessionDestroyedByBackground: destroyed ?? false });
  },

  setLiquidFgsSuppressResumePasswordLockUntil: suppressUntil => {
    set({ liquidFgsSuppressResumePasswordLockUntil: suppressUntil ?? null });
  },

  resetGlobalState: () => {
    const resolver = pendingLockResolver;

    activeLockRequest = null;
    pendingLockResolver = null;
    set(createGlobalInitialState());

    resolver?.reject(new LockScreenError(LockScreenErrorCode.Canceled));
  },
}));
