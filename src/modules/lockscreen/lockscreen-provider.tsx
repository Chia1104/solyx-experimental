import type { ReactNode } from 'react';
import { createContext, use, useCallback, useEffect, useMemo, useRef, useState } from 'react';

import * as Crypto from 'react-native-quick-crypto';

import type {
  LockRequest,
  LockRequestInput,
  LockRequestResult,
  LockRequestResultMap,
  LockRequestType,
} from './types';
import { LockScreenError, LockScreenErrorCode } from './types';

interface PendingResolver {
  id: string;
  reject: (reason?: Error) => void;
  resolve: (value: LockRequestResultMap[LockRequestType]) => void;
}

interface LockScreenActions {
  hasActiveRequest: () => boolean;
  rejectLockRequest: (error?: Error) => void;
  requestLock: <T extends LockRequestType>(
    request: Extract<LockRequestInput, { type: T }>,
  ) => Promise<LockRequestResult<T>>;
  resolveLockRequest: (request: LockRequest, result: LockRequestResultMap[LockRequestType]) => void;
}

const LockScreenRequestContext = createContext<LockRequest | null>(null);
const LockScreenActionsContext = createContext<LockScreenActions | null>(null);

export const LockScreenProvider = ({ children }: { children: ReactNode }) => {
  const [request, setRequest] = useState<LockRequest | null>(null);

  const requestRef = useRef<LockRequest | null>(null);
  const resolverRef = useRef<PendingResolver | null>(null);

  const clearRequest = useCallback(() => {
    requestRef.current = null;
    setRequest(null);
  }, []);

  const hasActiveRequest = useCallback(() => Boolean(requestRef.current), []);

  const rejectLockRequest = useCallback(
    (error?: Error) => {
      const resolver = resolverRef.current;

      if (!resolver) return;

      resolverRef.current = null;
      clearRequest();
      resolver.reject(error ?? new LockScreenError(LockScreenErrorCode.Canceled));
    },
    [clearRequest],
  );

  const requestLock = useCallback(
    <T extends LockRequestType>(input: Extract<LockRequestInput, { type: T }>) => {
      if (requestRef.current || resolverRef.current) {
        return Promise.reject(
          new LockScreenError(LockScreenErrorCode.RequestInProgress, 'Lock request already active'),
        );
      }

      const nextRequest = {
        ...input,
        id: Crypto.randomUUID(),
      } as Extract<LockRequest, { type: T }>;

      requestRef.current = nextRequest;
      setRequest(nextRequest);

      return new Promise<LockRequestResult<T>>((resolve, reject) => {
        resolverRef.current = {
          id: nextRequest.id,
          reject,
          resolve: value => {
            resolve(value as LockRequestResult<T>);
          },
        };
      });
    },
    [],
  );

  const resolveLockRequest = useCallback(
    (resolvedRequest: LockRequest, result: LockRequestResultMap[LockRequestType]) => {
      const resolver = resolverRef.current;

      if (!resolver || resolver.id !== resolvedRequest.id) return;

      resolverRef.current = null;
      clearRequest();
      resolver.resolve(result);
    },
    [clearRequest],
  );

  useEffect(
    () => () => {
      const resolver = resolverRef.current;

      if (!resolver) return;

      resolverRef.current = null;
      requestRef.current = null;
      resolver.reject(new LockScreenError(LockScreenErrorCode.Canceled));
    },
    [],
  );

  const actions = useMemo(
    () => ({
      hasActiveRequest,
      rejectLockRequest,
      requestLock,
      resolveLockRequest,
    }),
    [hasActiveRequest, rejectLockRequest, requestLock, resolveLockRequest],
  );

  return (
    <LockScreenActionsContext value={actions}>
      <LockScreenRequestContext value={request}>{children}</LockScreenRequestContext>
    </LockScreenActionsContext>
  );
};

export const useLockScreenRequest = () => use(LockScreenRequestContext);

export const useLockScreenActions = (namespace = 'useLockScreenActions') => {
  const context = use(LockScreenActionsContext);

  if (!context) {
    throw new Error(`${namespace} must be used within LockScreenProvider`);
  }

  return context;
};
