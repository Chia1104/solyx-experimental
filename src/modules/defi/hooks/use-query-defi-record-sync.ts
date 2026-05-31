import type { UseQueryOptions } from '@tanstack/react-query';
import { queryOptions, useQuery } from '@tanstack/react-query';

import { syncDefiRecords } from '@/modules/defi/services/defi-record-sync.service';
import type {
  DefiRecordSyncContext,
  ExplorerRecordsSyncMode,
} from '@/modules/defi/utils/defi-record-sync.utils';

type DefiRecordSyncQueryData = Awaited<ReturnType<typeof syncDefiRecords>>;

export const DEFI_RECORD_SYNC_QUERY_KEY = ['defi/records', 'sync'] as const;

type UseQueryDefiRecordSyncOptions = Omit<
  UseQueryOptions<DefiRecordSyncQueryData | null, Error>,
  'enabled' | 'queryFn' | 'queryKey'
> & {
  enabled?: boolean;
};

export const queryDefiRecordSyncOptions = (
  context: DefiRecordSyncContext | null,
  mode: ExplorerRecordsSyncMode = 'latest',
  options?: UseQueryDefiRecordSyncOptions,
) => {
  return queryOptions({
    enabled: Boolean(context?.address && context?.dbChainId) && (options?.enabled ?? true),
    gcTime: 0,
    queryFn: async () => {
      if (!context) {
        return null;
      }

      return syncDefiRecords({ context, mode });
    },
    queryKey: [
      ...DEFI_RECORD_SYNC_QUERY_KEY,
      context?.dbChainId,
      context?.address,
      context?.liquidSubaccountPointer,
      mode,
    ],
    refetchOnMount: 'always',
    staleTime: 0,
    ...options,
  });
};

export const useQueryDefiRecordSync = (
  context: DefiRecordSyncContext | null,
  mode: ExplorerRecordsSyncMode = 'latest',
  options?: UseQueryDefiRecordSyncOptions,
) => {
  return useQuery(queryDefiRecordSyncOptions(context, mode, options));
};
