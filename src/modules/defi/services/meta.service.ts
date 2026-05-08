import { CommonResponse } from '@/libs/request/pipes/commans.pipe';

import { protectedCefiClient } from '../../cefi/client';
import { DefiMeta, Prices } from '../pipes/meta.pipe';

export const getDefiMeta = async () => {
  const response = await protectedCefiClient.get('v1/meta').json();

  return CommonResponse.extend({
    data: DefiMeta,
  }).parse(response).data;
};

export const getPrices = async () => {
  const response = await protectedCefiClient.get('v1/meta/prices').json();

  return CommonResponse.extend({
    data: Prices,
  }).parse(response).data;
};
