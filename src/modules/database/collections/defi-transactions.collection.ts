import { persistedCollectionOptions } from '@tanstack/expo-db-sqlite-persistence';
import { createCollection } from '@tanstack/react-db';

import type { TransactionItem } from '@/modules/defi/pipes/wallets.pipe';

import { recordDbPersistence } from '../client';

export type DefiTransaction = TransactionItem;

export const getDefiTransactionKey = ({
  chainId,
  txId,
  fromAddress,
  toAddress,
  symbol,
}: DefiTransaction) => {
  return [chainId, txId, fromAddress, toAddress, symbol]
    .map(value => value?.trim().toLocaleLowerCase())
    .join(':');
};

export const defiTransactionsCollection = createCollection(
  persistedCollectionOptions<DefiTransaction, string>({
    id: 'defi-transactions',
    getKey: getDefiTransactionKey,
    persistence: recordDbPersistence,
    schemaVersion: 1,
  }),
);
