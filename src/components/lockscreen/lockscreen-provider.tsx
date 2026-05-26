import type { ReactNode } from 'react';
import { useEffect } from 'react';

import { useGlobalStore } from '@/modules/app/stores/global';
import { LockScreenError, LockScreenErrorCode } from '@/modules/app/types/log-request.type';

export const LockScreenProvider = ({ children }: { children: ReactNode }) => {
  const rejectLockVerification = useGlobalStore(store => store.rejectLockVerification);

  useEffect(
    () => () => {
      rejectLockVerification(new LockScreenError(LockScreenErrorCode.Canceled));
    },
    [rejectLockVerification],
  );

  return children;
};
