export const RecordStatus = {
  Failed: '0',
  Success: '1',
  Pending: '2',
} as const;

export type RecordStatus = (typeof RecordStatus)[keyof typeof RecordStatus];

export const ActionKey = {
  Sent: 'sent',
  Received: 'received',
  Swap: 'swap',
  ContractCall: 'contractCall',
  Approve: 'approve',
  Transfer: 'transfer',
} as const;

export type ActionKey = (typeof ActionKey)[keyof typeof ActionKey];
