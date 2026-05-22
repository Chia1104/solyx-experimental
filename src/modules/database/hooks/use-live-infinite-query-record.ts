import { and, eq, useLiveInfiniteQuery } from '@tanstack/react-db';

import { defiTransactionsCollection } from '../collections/defi-transactions.collection';
import { UserChainRecordParams } from '../pipes/defi-record.pipe';

export const useLiveInfiniteQueryRecord = (params: UserChainRecordParams) => {
  const query = UserChainRecordParams.parse(params);
  return useLiveInfiniteQuery(
    q =>
      q
        .from({ records: defiTransactionsCollection })
        .where(({ records }) =>
          and(eq(records.chainId, query.chainId), eq(records.userAddress, query.userAddress)),
        )
        .orderBy(({ records }) => records.timeStamp, 'desc'),
    {
      pageSize: 20,
      getNextPageParam: (lastPage, allPages) =>
        lastPage.length === 20 ? allPages.length : undefined,
    },
  );
};
