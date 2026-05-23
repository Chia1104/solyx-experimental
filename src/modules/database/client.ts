import { defineRelations } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/expo-sqlite';
import { openDatabaseSync } from 'expo-sqlite';

import * as schema from './schema/defi-record.schema';

export const recordDbExpo = openDatabaseSync('record.db', { enableChangeListener: true });
export const recordDb = drizzle(recordDbExpo, {
  schema: {
    defiRecord: schema.defiRecord,
  },
  relations: defineRelations({
    defiRecord: schema.defiRecord,
  }),
});
