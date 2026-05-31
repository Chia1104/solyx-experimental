import type { UseMutationOptions } from '@tanstack/react-query';
import { mutationOptions, useMutation } from '@tanstack/react-query';

import { ChainType } from '@/modules/chain/stores/chain-adapter/types';
import { syncLiquidDefiRecords } from '@/modules/defi/services/defi-record-sync.service';
import type { DefiRecordSyncContext } from '@/modules/defi/utils/defi-record-sync.utils';

export const DEFI_RECORD_LOAD_MORE_MUTATION_KEY = ['defi/records', 'load-more'] as const;

type LoadMoreDefiRecordsData = Awaited<ReturnType<typeof syncLiquidDefiRecords>> | undefined;

export interface LoadMoreDefiRecordsParams {
  context: DefiRecordSyncContext | null;
  first: number;
}

export const loadMoreDefiRecords = async ({ context, first }: LoadMoreDefiRecordsParams) => {
  if (!context || context.chainType !== ChainType.LIQUID) {
    return;
  }

  return syncLiquidDefiRecords({
    context,
    first,
  });
};

type UseMutationDefiRecordLoadMoreOptions = Omit<
  UseMutationOptions<LoadMoreDefiRecordsData, Error, LoadMoreDefiRecordsParams>,
  'mutationFn' | 'mutationKey'
>;

export const mutationDefiRecordLoadMoreOptions = (
  options?: UseMutationDefiRecordLoadMoreOptions,
) => {
  return mutationOptions({
    mutationFn: loadMoreDefiRecords,
    mutationKey: DEFI_RECORD_LOAD_MORE_MUTATION_KEY,
    ...options,
  });
};

export const useMutationDefiRecordLoadMore = (options?: UseMutationDefiRecordLoadMoreOptions) => {
  return useMutation(mutationDefiRecordLoadMoreOptions(options));
};
