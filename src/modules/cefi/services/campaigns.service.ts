import { CommonResponse } from '@/modules/request/pipes/commans.pipe';

import { protectedCefiClient } from '../client';
import type { ClaimRewardRequest } from '../pipes/campaigns.pipe';
import { ClaimReward } from '../pipes/campaigns.pipe';

export const claimReward = async (request: ClaimRewardRequest) => {
  const response = await protectedCefiClient
    .post('v1/campaigns/claim-reward', {
      json: request,
    })
    .json();

  return CommonResponse.extend({
    data: ClaimReward,
  }).parse(response).data;
};
