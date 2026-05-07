import { drizzle } from 'drizzle-orm/expo-sqlite';
import { openDatabaseSync } from 'expo-sqlite';

export const recordDbExpo = openDatabaseSync('record.db');
export const recordDb = drizzle(recordDbExpo);
