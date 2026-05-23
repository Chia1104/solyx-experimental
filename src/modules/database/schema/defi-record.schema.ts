import { integer, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';

import { ActionKey, RecordStatus } from '../enums/defi-record.enum';

export const defiRecord = sqliteTable(
  'defiRecord',
  {
    id: integer('id').primaryKey().notNull(),
    userAddress: text('userAddress').notNull(),
    chainId: text('chainId').notNull(),
    blockNumber: text('blockNumber').notNull(),
    timeStamp: text('timeStamp').notNull(),
    hash: text('hash').notNull(),
    nonce: text('nonce').notNull(),
    fromAddress: text('fromAddress').notNull(),
    toAddress: text('toAddress').notNull(),
    value: text('value').notNull(),
    tokenSymbol: text('tokenSymbol').notNull(),
    tokenDecimal: text('tokenDecimal').notNull(),
    gas: text('gas').notNull(),
    gasPrice: text('gasPrice').notNull(),
    status: text('status', {
      enum: [RecordStatus.Failed, RecordStatus.Success, RecordStatus.Pending],
    }).notNull(),
    input: text('input').notNull(),
    functionName: text('functionName', {
      enum: [
        ActionKey.Sent,
        ActionKey.Received,
        ActionKey.Swap,
        ActionKey.ContractCall,
        ActionKey.Approve,
        ActionKey.Transfer,
      ],
    }).notNull(),
    explorerUrl: text('explorerUrl').notNull(),
  },
  table => [
    uniqueIndex('defi_record_user_chain_hash_unique_idx').on(
      table.userAddress,
      table.chainId,
      table.hash,
    ),
  ],
);

export type DefiRecordRow = typeof defiRecord.$inferSelect;
export type NewDefiRecordRow = typeof defiRecord.$inferInsert;
