import type { ReactNode } from 'react';
import { useEffect } from 'react';

import { useGlobalStore } from '@/modules/app/stores/global';
import { LockScreenError, LockScreenErrorCode } from '@/modules/app/types/log-request.type';

export const LockScreenProvider = ({ children }: { children: ReactNode }) => {
  const rejectLockRequest = useGlobalStore(store => store.rejectLockRequest);

  useEffect(
    () => () => {
      rejectLockRequest(new LockScreenError(LockScreenErrorCode.Canceled));
    },
    [rejectLockRequest],
  );

  return children;
};
