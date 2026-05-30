import { and, desc, eq, sql } from 'drizzle-orm';

import { db } from '../client';
import { InsertRecordsParams } from '../pipes/defi-record.pipe';
import { defiRecord } from '../schema/defi-record.schema';

export const insertRecords = async (params: InsertRecordsParams) => {
  const records = InsertRecordsParams.parse(params);
  return db
    .insert(defiRecord)
    .values(records)
    .onConflictDoUpdate({
      target: [defiRecord.userAddress, defiRecord.chainId, defiRecord.hash],
      set: {
        blockNumber: sql`excluded.blockNumber`,
        timeStamp: sql`excluded.timeStamp`,
        nonce: sql`excluded.nonce`,
        fromAddress: sql`excluded.fromAddress`,
        toAddress: sql`excluded.toAddress`,
        value: sql`excluded.value`,
        tokenSymbol: sql`excluded.tokenSymbol`,
        tokenDecimal: sql`excluded.tokenDecimal`,
        gas: sql`excluded.gas`,
        gasPrice: sql`excluded.gasPrice`,
        status: sql`excluded.status`,
        input: sql`excluded.input`,
        functionName: sql`excluded.functionName`,
        explorerUrl: sql`excluded.explorerUrl`,
      },
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
