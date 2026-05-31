import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import { QueryClient } from '@tanstack/react-query';
import type { PersistQueryClientOptions } from '@tanstack/react-query-persist-client';

import { createAsyncKvPersisterStorage, queryKv } from '@/modules/kv';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
});

export const queryPersister = createAsyncStoragePersister({
  storage: createAsyncKvPersisterStorage(queryKv),
});

export const persistOptions: Omit<PersistQueryClientOptions, 'queryClient'> = {
  persister: queryPersister,
  maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
};
