import type { ChainType } from '@/modules/chain/stores/chain-adapter/types';
import type { TransactionConfirmParams } from '@/modules/chain/utils/transaction-confirm';

export type TransactionCallbackPayload = string | { message: string; code: number };
export type TransactionCallback = (data: TransactionCallbackPayload) => void;

export interface UseTransactionConfirmOptions {
  chainType: ChainType;
  sendParams: TransactionConfirmParams;
  onSuccess?: (txHash: string, meta?: { gasFee: string }) => void;
  transactionCallBack?: TransactionCallback;
}
