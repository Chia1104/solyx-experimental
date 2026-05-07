import { and, asc, desc, eq, like, lt, sql } from 'drizzle-orm';

import { recordDb } from '../client';
import { RecordStatus } from '../enums/defi-record.enum';
import type { ActionKey } from '../enums/defi-record.enum';
import {
  DataBaseRecord,
  DeleteDefiRecordsBeyondLimitParams,
  DeleteDefiRecordsOlderThanDaysParams,
  DeleteUserRecordParams,
  HashParams,
  UpdateRecordBlockNumberParams,
  UpdateRecordStatusParams,
  UserChainRecordPaginatedParams,
  UserChainRecordParams,
} from '../pipes/defi-record.pipe';
import type {
  DataBaseRecord as DataBaseRecordParams,
  UpdateRecordStatusParams as UpdateRecordStatusParamsType,
} from '../pipes/defi-record.pipe';
import { defiRecord } from '../schema/defi-record.schema';
import type { DefiRecordRow, NewDefiRecordRow } from '../schema/defi-record.schema';

export interface DefiRecord {
  blockNumber: string;
  timeStamp: string;
  hash: string;
  nonce: string;
  from: string;
  to: string;
  value: string;
  tokenSymbol: string;
  tokenDecimal: string;
  gas: string;
  gasPrice: string;
  status: RecordStatus;
  input: string;
  functionName: ActionKey;
  chainId?: string;
  explorerUrl?: string;
}

const toDefiRecord = (row: DefiRecordRow): DefiRecord => ({
  blockNumber: row.blockNumber,
  timeStamp: row.timeStamp,
  hash: row.hash,
  nonce: row.nonce,
  from: row.fromAddress,
  to: row.toAddress,
  value: row.value,
  tokenSymbol: row.tokenSymbol,
  tokenDecimal: row.tokenDecimal,
  gas: row.gas,
  gasPrice: row.gasPrice,
  status: row.status,
  input: row.input,
  functionName: row.functionName,
  chainId: row.chainId,
  explorerUrl: row.explorerUrl,
});

export const checkAndInsertRecord = async (recordData: DataBaseRecordParams) => {
  const { userAddress, chainId, hash, ...otherData } = DataBaseRecord.parse(recordData);

  recordDb.transaction(tx => {
    const existingRecord = tx
      .select({ id: defiRecord.id })
      .from(defiRecord)
      .where(
        and(
          eq(defiRecord.userAddress, userAddress),
          eq(defiRecord.chainId, chainId),
          eq(defiRecord.hash, hash),
          sql`lower(${defiRecord.fromAddress}) = lower(${otherData.fromAddress})`,
          sql`lower(${defiRecord.toAddress}) = lower(${otherData.toAddress})`,
          sql`lower(${defiRecord.tokenSymbol}) = lower(${otherData.tokenSymbol})`,
        ),
      )
      .get();

    const values: NewDefiRecordRow = {
      userAddress,
      chainId,
      hash,
      ...otherData,
    };

    if (existingRecord) {
      tx.update(defiRecord).set(values).where(eq(defiRecord.id, existingRecord.id)).run();
      return;
    }

    tx.insert(defiRecord).values(values).run();
  });
};

export const fetchUserRecord = async (chainId: string, userAddress: string) => {
  const params = UserChainRecordParams.parse({ chainId, userAddress });

  return recordDb
    .select()
    .from(defiRecord)
    .where(
      and(eq(defiRecord.chainId, params.chainId), eq(defiRecord.userAddress, params.userAddress)),
    )
    .orderBy(desc(defiRecord.timeStamp))
    .all()
    .map(toDefiRecord);
};

export const fetchUserRecordPaginated = async (
  chainId: string,
  userAddress: string,
  options: { limit: number; offset: number },
) => {
  const params = UserChainRecordPaginatedParams.parse({
    chainId,
    userAddress,
    ...options,
  });

  const rows = recordDb
    .select()
    .from(defiRecord)
    .where(
      and(eq(defiRecord.chainId, params.chainId), eq(defiRecord.userAddress, params.userAddress)),
    )
    .orderBy(desc(defiRecord.timeStamp))
    .limit(params.limit + 1)
    .offset(params.offset)
    .all();
  const hasMore = rows.length > params.limit;
  const records = (hasMore ? rows.slice(0, params.limit) : rows).map(toDefiRecord);

  return { records, hasMore };
};

export const deleteDefiRecordsBeyondLimit = async (
  chainId: string,
  userAddress: string,
  limit: number,
) => {
  const params = DeleteDefiRecordsBeyondLimitParams.parse({ chainId, userAddress, limit });

  recordDb.run(sql`
    DELETE FROM ${defiRecord}
    WHERE ${defiRecord.chainId} = ${params.chainId}
      AND ${defiRecord.userAddress} = ${params.userAddress}
      AND ${defiRecord.id} IN (
        SELECT ${defiRecord.id}
        FROM ${defiRecord}
        WHERE ${defiRecord.chainId} = ${params.chainId}
          AND ${defiRecord.userAddress} = ${params.userAddress}
        ORDER BY ${defiRecord.timeStamp} DESC
        LIMIT -1 OFFSET ${params.limit}
      )
  `);
};

export const deleteDefiRecordsOlderThanDays = async (
  chainId: string,
  userAddress: string,
  days: number,
) => {
  const params = DeleteDefiRecordsOlderThanDaysParams.parse({ chainId, userAddress, days });
  const cutoff = String(Math.floor(Date.now() / 1000) - params.days * 24 * 60 * 60);

  recordDb
    .delete(defiRecord)
    .where(
      and(
        eq(defiRecord.chainId, params.chainId),
        eq(defiRecord.userAddress, params.userAddress),
        lt(defiRecord.timeStamp, cutoff),
      ),
    )
    .run();
};

export const fetchPendingRecords = async () => {
  return recordDb
    .select()
    .from(defiRecord)
    .where(eq(defiRecord.status, RecordStatus.Pending))
    .orderBy(asc(defiRecord.timeStamp))
    .all()
    .map(toDefiRecord);
};

export const fetchRecordByHash = async (hash: string) => {
  const params = HashParams.parse({ hash });
  const row = recordDb.select().from(defiRecord).where(eq(defiRecord.hash, params.hash)).get();

  return row ? toDefiRecord(row) : null;
};

export const updateRecordStatus = async (data: UpdateRecordStatusParamsType) => {
  const params = UpdateRecordStatusParams.parse(data);

  recordDb
    .update(defiRecord)
    .set({ status: params.status })
    .where(eq(defiRecord.hash, params.hash))
    .run();
};

export const udpateRecordStatus = updateRecordStatus;

export const updateRecordBlockNumber = async (hash: string, blockNumber: string) => {
  const params = UpdateRecordBlockNumberParams.parse({ hash, blockNumber });

  recordDb
    .update(defiRecord)
    .set({ blockNumber: params.blockNumber })
    .where(and(eq(defiRecord.hash, params.hash), eq(defiRecord.status, RecordStatus.Pending)))
    .run();
};

export const deleteUserRecord = async (userAddress: string) => {
  const params = DeleteUserRecordParams.parse({ userAddress });

  recordDb
    .delete(defiRecord)
    .where(
      and(eq(defiRecord.userAddress, params.userAddress), like(defiRecord.chainId, 'eip155:%')),
    )
    .run();
};

export const dropRecordTable = async () => {
  recordDb.run(sql`DROP TABLE IF EXISTS ${defiRecord}`);
};

export const selectLastBlockNumber = async (chainId: string, userAddress: string) => {
  const params = UserChainRecordParams.parse({ chainId, userAddress });

  const result = recordDb
    .select({ blockNumber: defiRecord.blockNumber })
    .from(defiRecord)
    .where(
      and(eq(defiRecord.chainId, params.chainId), eq(defiRecord.userAddress, params.userAddress)),
    )
    .orderBy(desc(defiRecord.blockNumber))
    .limit(1)
    .get();

  if (!result) {
    throw new Error('No records found for this user and chain');
  }

  return result.blockNumber;
};

export const fetchPendingHashes = async (chainId: string, userAddress: string) => {
  const params = UserChainRecordParams.parse({ chainId, userAddress });

  const rows = recordDb
    .select({ hash: defiRecord.hash })
    .from(defiRecord)
    .where(
      and(
        eq(defiRecord.chainId, params.chainId),
        eq(defiRecord.userAddress, params.userAddress),
        eq(defiRecord.status, RecordStatus.Pending),
      ),
    )
    .all();

  return new Set(rows.map(row => row.hash));
};

export const fetchAllHashes = async (chainId: string, userAddress: string) => {
  const params = UserChainRecordParams.parse({ chainId, userAddress });

  const rows = recordDb
    .select({ hash: defiRecord.hash })
    .from(defiRecord)
    .where(
      and(eq(defiRecord.chainId, params.chainId), eq(defiRecord.userAddress, params.userAddress)),
    )
    .all();

  return new Set(rows.map(row => row.hash));
};
