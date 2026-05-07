import { CommonResponse } from '@/modules/request/pipes/commans.pipe';

import { protectedCefiClient } from '../client';
import { Meta } from '../pipes/meta.pipe';

export const getMeta = async () => {
  const response = await protectedCefiClient.get('v1/meta').json();

  return CommonResponse.extend({
    data: Meta,
  }).parse(response).data;
};
