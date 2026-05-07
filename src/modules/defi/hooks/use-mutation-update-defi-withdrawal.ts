import type { UseMutationOptions } from '@tanstack/react-query';
import { mutationOptions, useMutation } from '@tanstack/react-query';

import type { DefiWithdrawalDetail, UpdateDefiWithdrawalRequest } from '../pipes/withdrawals.pipe';
import { updateDefiWithdrawal } from '../services/withdrawals.service';

type UseMutationUpdateDefiWithdrawalOptions = Omit<
  UseMutationOptions<DefiWithdrawalDetail, Error, UpdateDefiWithdrawalRequest>,
  'mutationKey' | 'mutationFn'
>;

export const mutationUpdateDefiWithdrawalOptions = (
  options?: UseMutationUpdateDefiWithdrawalOptions,
) => {
  return mutationOptions({
    mutationKey: ['defi/withdrawals', 'v1/defi-withdrawals:update'],
    mutationFn: updateDefiWithdrawal,
    ...options,
  });
};

export const useMutationUpdateDefiWithdrawal = (
  options?: UseMutationUpdateDefiWithdrawalOptions,
) => {
  return useMutation(mutationUpdateDefiWithdrawalOptions(options));
};
