import type { UseMutationOptions } from '@tanstack/react-query';
import { mutationOptions, useMutation } from '@tanstack/react-query';

import type {
  DefiWithdrawalEstimateFee,
  DefiWithdrawalEstimateFeeRequest,
} from '../pipes/withdrawals.pipe';
import { getDefiWithdrawalEstimateFee } from '../services/withdrawals.service';

type UseMutationDefiWithdrawalEstimateFeeOptions = Omit<
  UseMutationOptions<DefiWithdrawalEstimateFee, Error, DefiWithdrawalEstimateFeeRequest>,
  'mutationKey' | 'mutationFn'
>;

export const mutationDefiWithdrawalEstimateFeeOptions = (
  options?: UseMutationDefiWithdrawalEstimateFeeOptions,
) => {
  return mutationOptions({
    mutationKey: ['defi/withdrawals', 'v1/defi-withdrawals:get-estimate-fee'],
    mutationFn: getDefiWithdrawalEstimateFee,
    ...options,
  });
};

export const useMutationDefiWithdrawalEstimateFee = (
  options?: UseMutationDefiWithdrawalEstimateFeeOptions,
) => {
  return useMutation(mutationDefiWithdrawalEstimateFeeOptions(options));
};
