import { CommonResponse } from '@/libs/request/pipes/commans.pipe';

import { protectedCefiClient } from '../client';
import { Banners } from '../pipes/banners.pipe';

export const getBanners = async () => {
  const response = await protectedCefiClient.get('v1/banners').json();

  return CommonResponse.extend({
    data: Banners,
  }).parse(response).data;
};
