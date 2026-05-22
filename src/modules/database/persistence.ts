import { createExpoSQLitePersistence } from '@tanstack/expo-db-sqlite-persistence';

import { recordDbExpo } from './client';

export const recordDbPersistence = createExpoSQLitePersistence({
  // @ts-expect-error - TODO: fix this
  database: recordDbExpo,
});
