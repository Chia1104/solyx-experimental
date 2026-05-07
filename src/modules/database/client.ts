import { createExpoSQLitePersistence } from '@tanstack/expo-db-sqlite-persistence';
import { drizzle } from 'drizzle-orm/expo-sqlite';
import { openDatabaseSync } from 'expo-sqlite';

export const recordDbExpo = openDatabaseSync('record.db');
export const recordDb = drizzle(recordDbExpo);

export const recordDbPersistence = createExpoSQLitePersistence({
  // @ts-expect-error - TODO: fix this
  database: recordDbExpo,
});
