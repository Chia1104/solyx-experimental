import * as z from 'zod';

import { ActionKey, RecordStatus } from '../enums/defi-record.enum';

export const DataBaseRecord = z.object({
  userAddress: z.string(),
  chainId: z.string(),
  blockNumber: z.string(),
  timeStamp: z.string(),
  hash: z.string(),
  nonce: z.string(),
  fromAddress: z.string(),
  toAddress: z.string(),
  value: z.string(),
  tokenSymbol: z.string(),
  tokenDecimal: z.string(),
  gas: z.string(),
  gasPrice: z.string(),
  status: z.enum(RecordStatus),
  input: z.string(),
  functionName: z.enum(ActionKey),
  explorerUrl: z.string(),
});

export type DataBaseRecord = z.infer<typeof DataBaseRecord>;

export const UserChainRecordParams = z.object({
  chainId: z.string(),
  userAddress: z.string(),
});

export type UserChainRecordParams = z.infer<typeof UserChainRecordParams>;

export const UserChainRecordPaginatedParams = UserChainRecordParams.extend({
  limit: z.number().int().positive(),
  offset: z.number().int().nonnegative(),
});

export type UserChainRecordPaginatedParams = z.infer<typeof UserChainRecordPaginatedParams>;

export const DeleteDefiRecordsBeyondLimitParams = UserChainRecordParams.extend({
  limit: z.number().int().positive(),
});

export type DeleteDefiRecordsBeyondLimitParams = z.infer<typeof DeleteDefiRecordsBeyondLimitParams>;

export const DeleteDefiRecordsOlderThanDaysParams = UserChainRecordParams.extend({
  days: z.number().int().positive(),
});

export type DeleteDefiRecordsOlderThanDaysParams = z.infer<
  typeof DeleteDefiRecordsOlderThanDaysParams
>;

export const HashParams = z.object({
  hash: z.string(),
});

export type HashParams = z.infer<typeof HashParams>;

export const UpdateRecordStatusParams = HashParams.extend({
  status: z.enum(RecordStatus),
});

export type UpdateRecordStatusParams = z.infer<typeof UpdateRecordStatusParams>;

export const UpdateRecordBlockNumberParams = HashParams.extend({
  blockNumber: z.string(),
});

export type UpdateRecordBlockNumberParams = z.infer<typeof UpdateRecordBlockNumberParams>;

export const DeleteUserRecordParams = z.object({
  userAddress: z.string(),
});

export type DeleteUserRecordParams = z.infer<typeof DeleteUserRecordParams>;
