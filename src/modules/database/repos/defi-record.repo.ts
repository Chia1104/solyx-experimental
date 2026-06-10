import type { SQL } from 'drizzle-orm';
import { and, count, desc, eq, getColumns, sql } from 'drizzle-orm';

import { db } from '../client';
import { RecordStatus } from '../enums/defi-record.enum';
import type { InsertDefiRecordInput, NewDefiRecordRow } from '../schema/defi-record.schema';
import { defiRecord } from '../schema/defi-record.schema';
import { buildDefiRecordKey } from '../utils/defi-record-key';

type DefiRecordColumnName = keyof typeof defiRecord._.columns;

const conflictUpdateAllExcept = (except: DefiRecordColumnName[]) => {
  const columns = getColumns(defiRecord);

  return Object.entries(columns).reduce<Partial<Record<DefiRecordColumnName, SQL>>>(
    (set, [columnKey, column]) => {
      if (!except.includes(columnKey as DefiRecordColumnName)) {
        set[columnKey as DefiRecordColumnName] = sql.raw(`excluded.${column.name}`);
      }

      return set;
    },
    {},
  );
};

export const insertRecords = async (params: InsertDefiRecordInput[]) => {
  if (params.length === 0) {
    return [];
  }

  const records = params.map(record => ({
    ...record,
    recordKey: buildDefiRecordKey({
      chainId: record.chainId,
      hash: record.hash,
      fromAddress: record.fromAddress,
      toAddress: record.toAddress,
    }),
  }));

  return db
    .insert(defiRecord)
    .values(records)
    .onConflictDoUpdate({
      target: [defiRecord.userAddress, defiRecord.chainId, defiRecord.recordKey],
      set: conflictUpdateAllExcept(['id', 'userAddress', 'chainId', 'recordKey']),
    })
    .returning();
};

export const getRecords = (params: { userAddress: string; chainId: string }) =>
  db
    .select()
    .from(defiRecord)
    .where(
      and(eq(defiRecord.userAddress, params.userAddress), eq(defiRecord.chainId, params.chainId)),
    )
    .orderBy(desc(defiRecord.timeStamp));

export const getAllRecords = () => db.select().from(defiRecord).orderBy(desc(defiRecord.timeStamp));

export const getPendingRecordHashes = async (params: { userAddress: string; chainId: string }) => {
  const rows = await db
    .select({ hash: defiRecord.hash })
    .from(defiRecord)
    .where(
      and(
        eq(defiRecord.userAddress, params.userAddress),
        eq(defiRecord.chainId, params.chainId),
        eq(defiRecord.status, RecordStatus.Pending),
      ),
    );

  return new Set(rows.map(row => row.hash));
};

export const countRecords = async (params: { userAddress: string; chainId: string }) => {
  const rows = await db
    .select({ value: count() })
    .from(defiRecord)
    .where(
      and(eq(defiRecord.userAddress, params.userAddress), eq(defiRecord.chainId, params.chainId)),
    );

  return rows[0]?.value ?? 0;
};

export const getRecordKeys = async (params: { userAddress: string; chainId: string }) => {
  const rows = await db
    .select({ recordKey: defiRecord.recordKey })
    .from(defiRecord)
    .where(
      and(eq(defiRecord.userAddress, params.userAddress), eq(defiRecord.chainId, params.chainId)),
    );

  return new Set(rows.map(row => row.recordKey));
};

export const insertMockRecords = async (mockRecord: NewDefiRecordRow) => {
  return db.insert(defiRecord).values(mockRecord).returning();
};

export const resetDefiRecords = async () => {
  return db.delete(defiRecord).returning();
};
