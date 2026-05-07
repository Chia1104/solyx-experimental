import type { UseMutationOptions } from '@tanstack/react-query';
import { mutationOptions, useMutation } from '@tanstack/react-query';

import type { DefiWithdrawalBankInfo } from '../pipes/withdrawals.pipe';
import { getDefiWithdrawalBankInfo } from '../services/withdrawals.service';

type UseMutationDefiWithdrawalBankInfoOptions = Omit<
  UseMutationOptions<DefiWithdrawalBankInfo, Error, void>,
  'mutationKey' | 'mutationFn'
>;

export const mutationDefiWithdrawalBankInfoOptions = (
  options?: UseMutationDefiWithdrawalBankInfoOptions,
) => {
  return mutationOptions({
    mutationKey: ['defi/withdrawals', 'v1/defi-withdrawals:get-bank-info'],
    mutationFn: getDefiWithdrawalBankInfo,
    ...options,
  });
};

export const useMutationDefiWithdrawalBankInfo = (
  options?: UseMutationDefiWithdrawalBankInfoOptions,
) => {
  return useMutation(mutationDefiWithdrawalBankInfoOptions(options));
};
