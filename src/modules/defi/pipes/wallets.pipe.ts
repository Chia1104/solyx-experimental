import * as z from 'zod';

import { TransactionAPIType, TransactionStatus } from '../enums/transactions.enum';

export const WalletItem = z.object({
  chainType: z.string(),
  address: z.string(),
});

export type WalletItem = z.infer<typeof WalletItem>;

export const AddWalletRequest = z.array(WalletItem);

export type AddWalletRequest = z.infer<typeof AddWalletRequest>;

export const WalletItems = z.array(WalletItem);

export type WalletItems = z.infer<typeof WalletItems>;

export const DeleteWalletRequest = z.object({
  chainType: z.string(),
  address: z.string(),
});

export type DeleteWalletRequest = z.infer<typeof DeleteWalletRequest>;

export const GetTransactionsRequest = z.object({
  chainId: z.string(),
  address: z.string(),
  startBlock: z.string().optional(),
  endBlock: z.string().optional(),
  symbol: z.string().optional(),
  page: z.number().optional(),
  perPage: z.number().optional(),
});

export type GetTransactionsRequest = z.infer<typeof GetTransactionsRequest>;

export const TransactionItem = z.object({
  chainId: z.string(),
  status: z.enum(TransactionStatus),
  type: z.enum(TransactionAPIType),
  txId: z.string(),
  fromAddress: z.string(),
  toAddress: z.string(),
  symbol: z.string().nullable(),
  contractAddress: z.string().nullable(),
  amount: z.string(),
  gasFee: z.string(),
  block: z.number(),
  blockTime: z.string(),
  isAppInitiated: z.boolean(),
  createTime: z.string(),
  updateTime: z.string(),
});

export type TransactionItem = z.infer<typeof TransactionItem>;

export const TransactionsMeta = z.object({
  totalRows: z.number(),
  totalPages: z.number(),
  perPage: z.number(),
  currentPage: z.number(),
});

export type TransactionsMeta = z.infer<typeof TransactionsMeta>;

export const TransactionsResponse = z.object({
  data: z.array(TransactionItem),
  meta: TransactionsMeta,
});

export type TransactionsResponse = z.infer<typeof TransactionsResponse>;

export const TransactionCallBackRequest = z.object({
  chainId: z.string(),
  address: z.string(),
  txId: z.string(),
});

export type TransactionCallBackRequest = z.infer<typeof TransactionCallBackRequest>;
