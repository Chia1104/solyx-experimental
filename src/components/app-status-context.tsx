import { createContext, useContext } from 'react';

import type { AppStatus } from '@/enums/app-status.enum';

export interface AppStatusContextValue {
  status: AppStatus;
  canProceed: boolean;
  isLoading: boolean;
  openStore: () => void;
  refetch: () => void;
}

export const AppStatusContext = createContext<AppStatusContextValue | null>(null);

export const useAppStatus = () => {
  const context = useContext(AppStatusContext);

  if (!context) {
    throw new Error('useAppStatus must be used within AppStatusContext.Provider');
  }

  return context;
};
