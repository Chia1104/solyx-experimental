import type { UseMutationOptions } from '@tanstack/react-query';
import { mutationOptions, useMutation } from '@tanstack/react-query';

import type {
  DefiWithdrawalDetail,
  ResubmitDefiWithdrawalRequest,
} from '../pipes/withdrawals.pipe';
import { resubmitDefiWithdrawal } from '../services/withdrawals.service';

type UseMutationResubmitDefiWithdrawalOptions = Omit<
  UseMutationOptions<DefiWithdrawalDetail, Error, ResubmitDefiWithdrawalRequest>,
  'mutationKey' | 'mutationFn'
>;

export const mutationResubmitDefiWithdrawalOptions = (
  options?: UseMutationResubmitDefiWithdrawalOptions,
) => {
  return mutationOptions({
    mutationKey: ['defi/withdrawals', 'v1/defi-withdrawals:resubmit'],
    mutationFn: resubmitDefiWithdrawal,
    ...options,
  });
};

export const useMutationResubmitDefiWithdrawal = (
  options?: UseMutationResubmitDefiWithdrawalOptions,
) => {
  return useMutation(mutationResubmitDefiWithdrawalOptions(options));
};
