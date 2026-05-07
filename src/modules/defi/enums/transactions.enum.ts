export const TransactionAPIType = {
  Send: 'SEND',
  Receive: 'RECEIVE',
  Unknown: 'UNKNOWN',
} as const;

export type TransactionAPIType = (typeof TransactionAPIType)[keyof typeof TransactionAPIType];

export const TransactionStatus = {
  Failed: 'FAILED',
  Success: 'SUCCESS',
} as const;

export type TransactionStatus = (typeof TransactionStatus)[keyof typeof TransactionStatus];
