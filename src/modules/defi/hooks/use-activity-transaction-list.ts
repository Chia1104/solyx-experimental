import { useCallback, useMemo, useState } from 'react';

import { useAsyncThrottledCallback } from '@tanstack/react-pacer';
import { useLiveQuery } from 'drizzle-orm/expo-sqlite';

import { useChainAdapterStore } from '@/modules/chain/stores/chain-adapter';
import { ChainType } from '@/modules/chain/stores/chain-adapter/types';
import { getRecords } from '@/modules/database/repos/defi-record.repo';
import type { DefiRecordRow } from '@/modules/database/schema/defi-record.schema';
import { useDefiAccount } from '@/modules/defi/hooks/use-defi-account';
import { useDefiRecordSync } from '@/modules/defi/hooks/use-defi-record-sync';
import { useQueryDefiRecordSync } from '@/modules/defi/hooks/use-query-defi-record-sync';
import {
  ACTIVITY_RECORDS_LIMIT,
  flattenActivitySections,
  groupActivityRecordsByDay,
} from '@/modules/defi/utils/activity-transaction.utils';
import { LIQUID_RECORDS_PAGE_SIZE } from '@/modules/defi/utils/defi-record-sync.utils';

const END_REACHED_COOLDOWN_MS = 600;
const EMPTY_RECORDS: DefiRecordRow[] = [];

interface LiquidPaginationState {
  hasMore: boolean;
  key: string;
  nextOffset: number;
}

const createLiquidPaginationState = (key: string): LiquidPaginationState => ({
  hasMore: true,
  key,
  nextOffset: LIQUID_RECORDS_PAGE_SIZE,
});

interface UseActivityTransactionListOptions {
  currencySymbol?: string;
}

const filterRecordsByCurrency = (records: DefiRecordRow[], currencySymbol?: string) => {
  if (!currencySymbol) {
    return records;
  }

  const normalizedCurrency = currencySymbol.toLowerCase();
  return records.filter(record => record.tokenSymbol?.toLowerCase() === normalizedCurrency);
};

export const useActivityTransactionList = (options?: UseActivityTransactionListOptions) => {
  const { currentAddress, dbChainId, isEVM, isLIQUID, isTRON, liquidSubaccountPointer } =
    useDefiAccount();
  const liquidLoggedIn = useChainAdapterStore(state => state.liquidLoggedIn);
  const { context, isSyncingRecords, loadMoreRecords, syncRecords } = useDefiRecordSync();
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const paginationKey = `${currentAddress}:${dbChainId}:${liquidSubaccountPointer ?? 0}`;
  const [liquidPagination, setLiquidPagination] = useState(() =>
    createLiquidPaginationState(paginationKey),
  );

  const recordsQuery = useLiveQuery(
    getRecords({ userAddress: currentAddress, chainId: dbChainId }),
    [currentAddress, dbChainId],
  );

  const allRecords = recordsQuery.data ?? EMPTY_RECORDS;
  const filteredRecords = useMemo(
    () => filterRecordsByCurrency(allRecords, options?.currencySymbol),
    [allRecords, options?.currencySymbol],
  );
  const isExplorerChain = isEVM || isTRON;

  const sections = useMemo(
    () => groupActivityRecordsByDay(filteredRecords.slice(0, ACTIVITY_RECORDS_LIMIT)),
    [filteredRecords],
  );
  const listData = useMemo(() => flattenActivitySections(sections), [sections]);
  const currentLiquidPagination =
    liquidPagination.key === paginationKey
      ? liquidPagination
      : createLiquidPaginationState(paginationKey);
  const hasMore = isLIQUID && currentLiquidPagination.hasMore;
  const isSyncEnabled =
    Boolean(context) && (context?.chainType !== ChainType.LIQUID || liquidLoggedIn);

  const syncQuery = useQueryDefiRecordSync(context, 'latest', {
    enabled: isSyncEnabled,
  });

  const isLoading =
    sections.length === 0 && isSyncEnabled && (syncQuery.isPending || syncQuery.isFetching);

  const onRefresh = useCallback(() => {
    setLiquidPagination(createLiquidPaginationState(paginationKey));
    void syncRecords('latest');
  }, [paginationKey, syncRecords]);

  const loadMore = useAsyncThrottledCallback(
    async () => {
      if (isLoadingMore) {
        return;
      }

      if (!hasMore) {
        return;
      }

      setIsLoadingMore(true);

      try {
        const result = await loadMoreRecords({ first: currentLiquidPagination.nextOffset });
        const fetchedCount = result?.fetchedCount ?? 0;
        setLiquidPagination(current => {
          const nextState =
            current.key === paginationKey ? current : createLiquidPaginationState(paginationKey);
          const hasFullPage = fetchedCount >= LIQUID_RECORDS_PAGE_SIZE;

          if (!hasFullPage) {
            return { ...nextState, hasMore: false };
          }

          return {
            ...nextState,
            nextOffset: nextState.nextOffset + LIQUID_RECORDS_PAGE_SIZE,
          };
        });
      } finally {
        setIsLoadingMore(false);
      }
    },
    { wait: END_REACHED_COOLDOWN_MS },
  );

  return {
    hasMore,
    isExplorerChain,
    isLoading,
    isLoadingMore,
    isRefreshing: isSyncingRecords,
    listData,
    loadMore,
    onRefresh,
    recordsLimit: ACTIVITY_RECORDS_LIMIT,
    sections,
  };
};
