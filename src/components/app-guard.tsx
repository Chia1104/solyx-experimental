import { useCallback, useMemo } from 'react';

import * as Device from 'expo-device';
import { useNetworkState } from 'expo-network';
import { Platform } from 'react-native';

import type { AppStatusContextValue } from '@/components/app-status-context';
import { AppStatus } from '@/enums/app-status.enum';
import { needsUpdate } from '@/libs/app/version';
import { useQueryMeta } from '@/modules/cefi/hooks/use-query-meta';

interface Props {
  children: (data: AppStatusContextValue) => React.ReactNode;
  fallback: React.ReactNode;
}

const LOCAL_VERSION = Device.osVersion ?? '0.0.0';

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
      const required =
        Platform.OS === 'ios'
          ? meta.clientVersions.forceUpdate.ios
          : meta.clientVersions.forceUpdate.android;
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

  if (isLoading) {
    return fallback;
  }

  return children({
    status,
    canProceed,
    isLoading,
    openStore: () => {
      /* empty */
    },
    refetch: handleRefetch,
  });
};
