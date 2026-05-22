import { mutationOptions, useMutation } from '@tanstack/react-query';

import { defiTransactionsCollection } from '../collections/defi-transactions.collection';
import type { DefiRecordRow } from '../schema/defi-record.schema';

export const insertRecordOptions = mutationOptions({
  mutationFn: (record: DefiRecordRow) => {
    const tx = defiTransactionsCollection.insert(record);
    return tx.commit();
  },
});

export const useInsertRecord = () => {
  return useMutation(insertRecordOptions);
};
