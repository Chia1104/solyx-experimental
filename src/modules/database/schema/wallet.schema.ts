import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const wallet = sqliteTable('wallet', {
  id: text('id').primaryKey().notNull(),
  name: text('name'),
  evmAddress: text('evmAddress'),
  tronAddress: text('tronAddress'),
  liquidAmpId: text('liquidAmpId'),
  liquidSubaccountPointer: integer('liquidSubaccountPointer'),
  imageId: integer('imageId').notNull(),
  createTime: text('createTime').notNull(),
  isImport: integer('isImport', { mode: 'boolean' }),
  chains: text('chains', { mode: 'json' }).$type<string[]>().notNull(),
  blockNumbers: text('blockNumbers', { mode: 'json' }).$type<Record<number, number>>().notNull(),
});

export type WalletRow = typeof wallet.$inferSelect;
export type NewWalletRow = typeof wallet.$inferInsert;
