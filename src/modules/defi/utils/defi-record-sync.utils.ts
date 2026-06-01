import type { ChainConfig, ChainType } from '@/modules/chain/stores/chain-adapter/types';
import type { InsertDefiRecordInput } from '@/modules/database/pipes/defi-record.pipe';
import { insertRecords } from '@/modules/database/repos/defi-record.repo';

export const DEFI_RECORDS_PER_PAGE = 50;
export const DEFI_RECORDS_LIMIT = 200;
export const LIQUID_RECORDS_PAGE_SIZE = 30;

const INSERT_BATCH_SIZE = 100;

export type ExplorerRecordsSyncMode = 'full' | 'latest';

export interface SyncDefiRecordsOptions {
  context: DefiRecordSyncContext;
  liquidFirst?: number;
  mode?: ExplorerRecordsSyncMode;
}

export interface DefiRecordSyncContext {
  address: string;
  chain: ChainConfig;
  chainType: ChainType;
  currentChainId: number;
  dbChainId: string;
  liquidSubaccountPointer: number;
}

export const buildDefiRecordSyncContext = ({
  chain,
  chainType,
  currentAddress,
  currentChainId,
  dbChainId,
  liquidSubaccountPointer,
}: {
  chain?: ChainConfig;
  chainType?: ChainType;
  currentAddress: string;
  currentChainId: number;
  dbChainId: string;
  liquidSubaccountPointer?: number;
}): DefiRecordSyncContext | null => {
  if (!currentAddress || !chain || chainType == null || !dbChainId) {
    return null;
  }

  return {
    address: currentAddress,
    chain,
    chainType,
    currentChainId,
    dbChainId,
    liquidSubaccountPointer: liquidSubaccountPointer ?? 0,
  };
};

export const toTransactionsApiChainId = (dbChainId: string) =>
  dbChainId.startsWith('eip155:') ? dbChainId.replace('eip155:', '') : dbChainId;

export const upsertRecordsInBatches = async (records: InsertDefiRecordInput[]) => {
  if (records.length === 0) {
    return 0;
  }

  for (let index = 0; index < records.length; index += INSERT_BATCH_SIZE) {
    await insertRecords(records.slice(index, index + INSERT_BATCH_SIZE));
  }

  return records.length;
};
