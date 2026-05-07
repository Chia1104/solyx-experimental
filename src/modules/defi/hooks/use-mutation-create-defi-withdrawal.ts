import type { UseMutationOptions } from '@tanstack/react-query';
import { mutationOptions, useMutation } from '@tanstack/react-query';

import type { DefiWithdrawalCreateRequest, DefiWithdrawalDetail } from '../pipes/withdrawals.pipe';
import { createDefiWithdrawal } from '../services/withdrawals.service';

type UseMutationCreateDefiWithdrawalOptions = Omit<
  UseMutationOptions<DefiWithdrawalDetail, Error, DefiWithdrawalCreateRequest>,
  'mutationKey' | 'mutationFn'
>;

export const mutationCreateDefiWithdrawalOptions = (
  options?: UseMutationCreateDefiWithdrawalOptions,
) => {
  return mutationOptions({
    mutationKey: ['defi/withdrawals', 'v1/defi-withdrawals'],
    mutationFn: createDefiWithdrawal,
    ...options,
  });
};

export const useMutationCreateDefiWithdrawal = (
  options?: UseMutationCreateDefiWithdrawalOptions,
) => {
  return useMutation(mutationCreateDefiWithdrawalOptions(options));
};
