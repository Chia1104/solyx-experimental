import { persistedCollectionOptions } from '@tanstack/expo-db-sqlite-persistence';
import { createCollection } from '@tanstack/react-db';

import { recordDbPersistence } from '../persistence';
import type { DefiRecordRow } from '../schema/defi-record.schema';

export const defiTransactionsCollection = createCollection(
  persistedCollectionOptions<DefiRecordRow, number>({
    id: 'defi-transactions',
    persistence: recordDbPersistence,
    schemaVersion: 1,
    getKey(item) {
      return item.id;
    },
  }),
);
