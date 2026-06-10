import type { Transaction } from '@roswell/react-native-gdk';

import { useChainAdapterStore } from '@/modules/chain/stores/chain-adapter';
import { ChainType } from '@/modules/chain/stores/chain-adapter/types';
import { countRecords, getPendingRecordHashes } from '@/modules/database/repos/defi-record.repo';
import { getTransactions } from '@/modules/defi/services/wallets.service';
import { mapApiTransactions } from '@/modules/defi/utils/defi-record-sync-api-transaction.utils';
import { mapLiquidTransactions } from '@/modules/defi/utils/defi-record-sync-liquid-transaction.utils';
import type {
  DefiRecordSyncContext,
  ExplorerRecordsSyncMode,
  SyncDefiRecordsOptions,
} from '@/modules/defi/utils/defi-record-sync.utils';
import {
  DEFI_RECORDS_LIMIT,
  DEFI_RECORDS_PER_PAGE,
  LIQUID_RECORDS_PAGE_SIZE,
  toTransactionsApiChainId,
  upsertRecordsInBatches,
} from '@/modules/defi/utils/defi-record-sync.utils';

// The explorer backend may not have finished indexing an address when the first
// sync runs (e.g. right after login), so "history is complete" can never be a
// one-shot flag — re-derive it from local count vs upstream total on every sync.
const isLocalHistoryIncomplete = async ({
  address,
  chainId,
  upstreamTotalRows,
}: {
  address: string;
  chainId: string;
  upstreamTotalRows: number;
}) => {
  const syncTarget = Math.min(upstreamTotalRows, DEFI_RECORDS_LIMIT);
  const localCount = await countRecords({ userAddress: address, chainId });

  return localCount < syncTarget;
};

const syncExplorerRecords = async ({
  apiChainId,
  mode = 'full',
  ...context
}: Parameters<typeof mapApiTransactions>[1] & {
  apiChainId: string;
  mode?: ExplorerRecordsSyncMode;
}) => {
  let page = 1;
  let insertedCount = 0;
  let fetchedCount = 0;
  let pageCount = 0;

  while (true) {
    const response = await getTransactions({
      chainId: apiChainId,
      address: context.address,
      page,
      perPage: DEFI_RECORDS_PER_PAGE,
    });

    pageCount += 1;
    fetchedCount += response.data.length;
    insertedCount += await upsertRecordsInBatches(mapApiTransactions(response.data, context));

    const totalFetched = (page - 1) * DEFI_RECORDS_PER_PAGE + response.data.length;
    const reachedRecordLimit = totalFetched >= DEFI_RECORDS_LIMIT;
    const hasFullPage = response.data.length >= DEFI_RECORDS_PER_PAGE;
    const hasMoreByMeta = response.meta.totalPages > 0 && page < response.meta.totalPages;

    if (reachedRecordLimit || (!hasFullPage && !hasMoreByMeta)) {
      break;
    }

    if (
      mode === 'latest' &&
      !(await isLocalHistoryIncomplete({
        address: context.address,
        chainId: context.chainId,
        upstreamTotalRows: response.meta.totalRows,
      }))
    ) {
      break;
    }

    page += 1;
  }

  return { insertedCount, fetchedCount, pageCount };
};

const resolveExplorerMode = async (
  context: DefiRecordSyncContext,
  mode: ExplorerRecordsSyncMode,
): Promise<ExplorerRecordsSyncMode> => {
  if (mode === 'full') {
    return mode;
  }

  const pendingHashes = await getPendingRecordHashes({
    userAddress: context.address,
    chainId: context.dbChainId,
  });

  return pendingHashes.size > 0 ? 'full' : mode;
};

const syncLiquidRecordsPage = async ({
  context,
  first = 0,
  count = LIQUID_RECORDS_PAGE_SIZE,
  subaccount,
  getTransactions,
  buildUnblindingUrl,
  chainId,
}: {
  context: Parameters<typeof mapLiquidTransactions>[0]['context'];
  first?: number;
  count?: number;
  subaccount: number;
  getTransactions: (params: {
    subaccount: number;
    first: number;
    count: number;
  }) => Promise<Transaction[]>;
  buildUnblindingUrl: (transaction: Transaction, chainId: number) => Promise<string | null>;
  chainId: number;
}) => {
  const transactions = await getTransactions({ subaccount, first, count });

  if (transactions.length === 0) {
    return { changedRecords: 0, fetchedCount: 0, first };
  }

  const records = await mapLiquidTransactions({
    buildExplorerUrl: async transaction => (await buildUnblindingUrl(transaction, chainId)) ?? '',
    context,
    transactions,
  });

  const changedRecords = await upsertRecordsInBatches(records);

  return { changedRecords, fetchedCount: transactions.length, first };
};

export const syncExplorerDefiRecords = async (
  context: DefiRecordSyncContext,
  mode: ExplorerRecordsSyncMode = 'latest',
) => {
  const effectiveMode = await resolveExplorerMode(context, mode);

  return syncExplorerRecords({
    address: context.address,
    chainId: context.dbChainId,
    chain: context.chain,
    isEVM: context.chainType === ChainType.EVM,
    isTRON: context.chainType === ChainType.TRON,
    apiChainId: toTransactionsApiChainId(context.dbChainId),
    mode: effectiveMode,
  });
};

export const syncLiquidDefiRecords = async ({
  context,
  first = 0,
}: {
  context: DefiRecordSyncContext;
  first?: number;
}) => {
  const { liquidLoggedIn, getTransactions, buildUnblindingUrl } = useChainAdapterStore.getState();

  if (!liquidLoggedIn) {
    return { changedRecords: 0, fetchedCount: 0, first };
  }

  return syncLiquidRecordsPage({
    buildUnblindingUrl,
    chainId: context.currentChainId,
    context: {
      address: context.address,
      chain: context.chain,
      chainId: context.dbChainId,
    },
    count: LIQUID_RECORDS_PAGE_SIZE,
    first,
    getTransactions,
    subaccount: context.liquidSubaccountPointer,
  });
};

export const syncDefiRecords = async ({
  context,
  liquidFirst = 0,
  mode = 'latest',
}: SyncDefiRecordsOptions) => {
  if (context.chainType === ChainType.LIQUID) {
    return syncLiquidDefiRecords({ context, first: liquidFirst });
  }

  return syncExplorerDefiRecords(context, mode);
};
