import { CommonResponse } from '@/modules/request/pipes/commans.pipe';

import { protectedCefiClient } from '../client';
import type {
  CreateOnrampOrderRequest,
  GetOnrampOrderDetailRequest,
  GetOnrampOrdersRequest,
} from '../pipes/onramp.pipe';
import {
  CreateOnrampOrder,
  OnrampOrderDetail,
  OnrampOrders,
  OnrampOrdersMeta,
} from '../pipes/onramp.pipe';

export const createOnrampOrder = async (request: CreateOnrampOrderRequest) => {
  const response = await protectedCefiClient
    .post('v1/onramp-orders', {
      json: request,
    })
    .json();

  return CommonResponse.extend({
    data: CreateOnrampOrder,
  }).parse(response).data;
};

export const getOnrampOrders = async (request: GetOnrampOrdersRequest = {}) => {
  const response = await protectedCefiClient
    .get('v1/onramp-orders', {
      searchParams: {
        finPerPage: request.finPerPage?.toString(),
        finPage: request.finPage,
      },
    })
    .json();

  return CommonResponse.extend({
    data: OnrampOrders,
    meta: OnrampOrdersMeta.optional(),
  }).parse(response);
};

export const getOnrampOrder = async ({
  orderId,
  syncWithProvider,
}: GetOnrampOrderDetailRequest) => {
  const response = await protectedCefiClient
    .get(`v1/onramp-orders/${orderId}`, {
      searchParams: {
        syncWithProvider: syncWithProvider ? '1' : undefined,
      },
    })
    .json();

  return CommonResponse.extend({
    data: OnrampOrderDetail,
  }).parse(response).data;
};
