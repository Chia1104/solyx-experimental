import { useMemo } from 'react';

import { useIsFetching, useIsMutating, useQueryClient } from '@tanstack/react-query';

import { useDefiAccount } from '@/modules/defi/hooks/use-defi-account';
import {
  DEFI_RECORD_LOAD_MORE_MUTATION_KEY,
  useMutationDefiRecordLoadMore,
} from '@/modules/defi/hooks/use-mutation-defi-record-load-more';
import type { LoadMoreDefiRecordsParams } from '@/modules/defi/hooks/use-mutation-defi-record-load-more';
import {
  DEFI_RECORD_SYNC_QUERY_KEY,
  queryDefiRecordSyncOptions,
} from '@/modules/defi/hooks/use-query-defi-record-sync';
import { buildDefiRecordSyncContext } from '@/modules/defi/utils/defi-record-sync.utils';
import type {
  DefiRecordSyncContext,
  ExplorerRecordsSyncMode,
} from '@/modules/defi/utils/defi-record-sync.utils';

export const useDefiRecordSyncContext = (): DefiRecordSyncContext | null => {
  const { chain, chainType, currentAddress, currentChainId, dbChainId, liquidSubaccountPointer } =
    useDefiAccount();

  return useMemo(
    () =>
      buildDefiRecordSyncContext({
        chain,
        chainType,
        currentAddress,
        currentChainId,
        dbChainId,
        liquidSubaccountPointer,
      }),
    [chain, chainType, currentAddress, currentChainId, dbChainId, liquidSubaccountPointer],
  );
};

export const useDefiRecordSync = () => {
  const queryClientInstance = useQueryClient();
  const loadMoreMutation = useMutationDefiRecordLoadMore();
  const context = useDefiRecordSyncContext();
  const isFetching = useIsFetching({ exact: false, queryKey: DEFI_RECORD_SYNC_QUERY_KEY });
  const isLoadMorePending = useIsMutating({ mutationKey: DEFI_RECORD_LOAD_MORE_MUTATION_KEY });
  const isSyncingRecords = isFetching > 0;
  const isLoadingMoreRecords = isLoadMorePending > 0;
  const isSyncing = isSyncingRecords || isLoadingMoreRecords;

  return {
    context,
    isLoadingMoreRecords,
    isSyncingRecords,
    isSyncing,
    loadMoreRecords: (params: Omit<LoadMoreDefiRecordsParams, 'context'>) =>
      loadMoreMutation.mutateAsync({ ...params, context }),
    syncRecords: async (mode: ExplorerRecordsSyncMode = 'latest') => {
      if (!context) {
        return;
      }

      await queryClientInstance.fetchQuery(queryDefiRecordSyncOptions(context, mode));
    },
  };
};
