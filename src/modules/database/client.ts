import { defineRelations } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/expo-sqlite';
import { openDatabaseSync } from 'expo-sqlite';

import * as defiRecordSchema from './schema/defi-record.schema';
import * as walletSchema from './schema/wallet.schema';

export const dbExpo = openDatabaseSync('record.db', { enableChangeListener: true });
export const db = drizzle(dbExpo, {
  schema: {
    defiRecord: defiRecordSchema.defiRecord,
    wallet: walletSchema.wallet,
  },
  relations: defineRelations({
    defiRecord: defiRecordSchema.defiRecord,
    wallet: walletSchema.wallet,
  }),
});
