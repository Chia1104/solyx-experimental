import { createContext, use, useCallback, useMemo } from 'react';

import * as Device from 'expo-device';
import { useNetworkState } from 'expo-network';
import { Platform } from 'react-native';

import { AppStatus } from '@/enums/app-status.enum';
import { needsUpdate } from '@/libs/app/version';
import { useQueryMeta } from '@/modules/cefi/hooks/use-query-meta';

interface AppGuardContext {
  status: AppStatus;
  canProceed: boolean;
  isLoading: boolean;
  openStore: () => void;
  refetch: () => void;
}

interface Props {
  children: ((data: AppGuardContext) => React.ReactNode) | React.ReactNode;
  fallback: React.ReactNode;
}

const LOCAL_VERSION = Device.osVersion ?? '0.0.0';

export const AppGuardContext = createContext<AppGuardContext | null>(null);

export const useAppGuard = (namespace = 'useAppGuard') => {
  const context = use(AppGuardContext);

  if (!context) {
    throw new Error(`${namespace} must be used within AppGuardContext.Provider`);
  }

  return context;
};

export const AppGuard = ({ children, fallback }: Props) => {
  const { isConnected } = useNetworkState();
  const {
    data: meta,
    isError,
    isLoading,
    refetch,
  } = useQueryMeta({
    enabled: isConnected,
  });

  const status = useMemo((): AppStatus => {
    if (!isConnected) return AppStatus.NoNetwork;
    if (isError) return AppStatus.RequestFailed;

    if (!meta) return AppStatus.Operational;

    if (meta.siteStatus === 'inMaintenance') return AppStatus.Maintenance;

    if (meta.clientVersions?.forceUpdate) {
      const required = Platform.select({
        ios: meta.clientVersions.forceUpdate.ios,
        android: meta.clientVersions.forceUpdate.android,
      });
      if (required && needsUpdate(LOCAL_VERSION, required)) {
        return AppStatus.UpdateRequired;
      }
    }

    if (meta.clientVersions?.update) {
      const suggested =
        Platform.OS === 'ios' ? meta.clientVersions.update.ios : meta.clientVersions.update.android;
      if (suggested && needsUpdate(LOCAL_VERSION, suggested)) {
        return AppStatus.UpdateSuggested;
      }
    }

    return AppStatus.Operational;
  }, [isError, meta, isConnected]);

  const handleRefetch = useCallback(() => {
    refetch();
  }, [refetch]);

  const canProceed =
    !isLoading && (status === AppStatus.Operational || status === AppStatus.UpdateSuggested);

  const context = useMemo(
    () => ({
      status,
      canProceed,
      isLoading,
      openStore: () => {
        /* empty */
      },
      refetch: handleRefetch,
    }),
    [status, canProceed, isLoading, handleRefetch],
  );

  if (isLoading) {
    return fallback;
  }

  return (
    <AppGuardContext value={context}>
      {typeof children === 'function' ? children(context) : children}
    </AppGuardContext>
  );
};
