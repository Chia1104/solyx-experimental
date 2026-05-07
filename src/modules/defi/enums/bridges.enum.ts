export const BridgeOrderStatus = {
  Pending: 'pending',
  Processing: 'processing',
  Completed: 'completed',
  Failed: 'failed',
  Expired: 'expired',
} as const;

export type BridgeOrderStatus = (typeof BridgeOrderStatus)[keyof typeof BridgeOrderStatus];
