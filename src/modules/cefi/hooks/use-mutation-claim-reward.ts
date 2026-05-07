import type { UseMutationOptions } from '@tanstack/react-query';
import { mutationOptions, useMutation } from '@tanstack/react-query';

import type { ClaimReward, ClaimRewardRequest } from '../pipes/campaigns.pipe';
import { claimReward } from '../services/campaigns.service';

type UseMutationClaimRewardOptions = Omit<
  UseMutationOptions<ClaimReward, Error, ClaimRewardRequest>,
  'mutationKey' | 'mutationFn'
>;

export const mutationClaimRewardOptions = (options?: UseMutationClaimRewardOptions) => {
  return mutationOptions({
    mutationKey: ['cefi/campaigns', 'v1/campaigns/claim-reward'],
    mutationFn: claimReward,
    ...options,
  });
};

export const useMutationClaimReward = (options?: UseMutationClaimRewardOptions) => {
  return useMutation(mutationClaimRewardOptions(options));
};
