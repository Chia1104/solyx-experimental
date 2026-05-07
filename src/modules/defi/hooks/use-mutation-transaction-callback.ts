import type { UseMutationOptions } from '@tanstack/react-query';
import { mutationOptions, useMutation } from '@tanstack/react-query';

import type { TransactionCallBackRequest } from '../pipes/wallets.pipe';
import { transactionCallBack } from '../services/wallets.service';

type UseMutationTransactionCallBackOptions = Omit<
  UseMutationOptions<void, Error, TransactionCallBackRequest>,
  'mutationKey' | 'mutationFn'
>;

export const mutationTransactionCallBackOptions = (
  options?: UseMutationTransactionCallBackOptions,
) => {
  return mutationOptions({
    mutationKey: ['defi/transactions', 'v1/defi/transactions:callback'],
    mutationFn: transactionCallBack,
    ...options,
  });
};

export const useMutationTransactionCallBack = (options?: UseMutationTransactionCallBackOptions) => {
  return useMutation(mutationTransactionCallBackOptions(options));
};
