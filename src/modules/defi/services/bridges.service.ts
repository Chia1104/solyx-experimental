import { CommonResponse } from '@/libs/request/pipes/commans.pipe';
import { toBridgeApiChainId } from '@/modules/chain/utils';

import { protectedCefiClient } from '../../cefi/client';
import type {
  CreateBridgeFixedRateOrderRequest,
  CreateBridgeOrderRequest,
  GetBridgeEstimatedFeeRequest,
  GetBridgeFixedRateEstimatedFeeRequest,
  GetBridgeOrderMetaRequest,
  GetBridgeOrderRequest,
  GetBridgeOrdersRequest,
  UpdateBridgePaymentTxHashRequest,
} from '../pipes/bridges.pipe';
import {
  BridgeEstimatedFee,
  BridgeFixedRateEstimatedFee,
  BridgeMetaPairs,
  BridgeOrder,
  BridgeOrderMeta,
  BridgeOrdersResponse,
  BridgeSupportedChains,
  CreateBridgeOrder,
} from '../pipes/bridges.pipe';

const createBridgeOrdersSearchParams = ({
  statuses,
  finPerPage,
  finPage,
}: GetBridgeOrdersRequest) => {
  const searchParams = new URLSearchParams();

  statuses?.forEach(status => {
    searchParams.append('statuses', status);
  });

  if (finPerPage !== undefined) {
    searchParams.set('finPerPage', String(finPerPage));
  }

  if (finPage !== undefined) {
    searchParams.set('finPage', finPage);
  }

  return searchParams;
};

export const getBridgeOrders = async (request: GetBridgeOrdersRequest = {}) => {
  const response = await protectedCefiClient
    .get('v1/bridges/orders', {
      searchParams: createBridgeOrdersSearchParams(request),
    })
    .json();

  return BridgeOrdersResponse.parse(response);
};

export const createBridgeOrder = async (request: CreateBridgeOrderRequest) => {
  const response = await protectedCefiClient
    .post('v1/bridges/orders', {
      json: request,
    })
    .json();

  return CommonResponse.extend({
    data: CreateBridgeOrder,
  }).parse(response).data;
};

export const createBridgeFixedRateOrder = async (request: CreateBridgeFixedRateOrderRequest) => {
  const response = await protectedCefiClient
    .post('v1/bridges/orders:create-fixed-rate', {
      json: {
        fromChainId: toBridgeApiChainId(request.fromChainId),
        toChainId: toBridgeApiChainId(request.toChainId),
        fromToken: request.fromToken,
        toToken: request.toToken,
        ...(request.fromAddress ? { fromAddress: request.fromAddress } : {}),
        toAddress: request.toAddress,
        amount: request.amount,
        rateId: request.rateId,
      },
    })
    .json();

  return CommonResponse.extend({
    data: CreateBridgeOrder,
  }).parse(response).data;
};

export const getBridgeOrder = async ({ id }: GetBridgeOrderRequest) => {
  const response = await protectedCefiClient.get(`v1/bridges/orders/${id}`).json();

  return CommonResponse.extend({
    data: BridgeOrder,
  }).parse(response).data;
};

export const getBridgeEstimatedFee = async (request: GetBridgeEstimatedFeeRequest) => {
  const response = await protectedCefiClient
    .post('v1/bridges/orders:get-estimated-fee', {
      json: {
        ...request,
        ...(request.fromChainId !== undefined
          ? { fromChainId: toBridgeApiChainId(request.fromChainId) }
          : {}),
        toChainId: toBridgeApiChainId(request.toChainId),
      },
    })
    .json();

  return CommonResponse.extend({
    data: BridgeEstimatedFee,
  }).parse(response).data;
};

export const getBridgeFixedRateEstimatedFee = async (
  request: GetBridgeFixedRateEstimatedFeeRequest,
) => {
  const response = await protectedCefiClient
    .post('v1/bridges/orders:get-fixed-rate-estimated-fee', {
      json: {
        ...request,
        fromChainId: toBridgeApiChainId(request.fromChainId),
        toChainId: toBridgeApiChainId(request.toChainId),
      },
    })
    .json();

  return CommonResponse.extend({
    data: BridgeFixedRateEstimatedFee,
  }).parse(response).data;
};

export const updateBridgePaymentTxHash = async ({
  id,
  txHash,
  gasFee,
}: UpdateBridgePaymentTxHashRequest) => {
  await protectedCefiClient.post(`v1/bridges/orders/${id}:update-payment-txhash`, {
    json: { txHash, gasFee },
  });
};

export const getBridgeOrderMeta = async ({
  fromChainId,
  toChainId,
  fromToken,
  toToken,
}: GetBridgeOrderMetaRequest) => {
  const response = await protectedCefiClient
    .get('v1/bridges/meta', {
      searchParams: {
        ...(fromChainId !== undefined ? { fromChainId: toBridgeApiChainId(fromChainId) } : {}),
        toChainId: toBridgeApiChainId(toChainId),
        fromToken,
        toToken,
      },
    })
    .json();

  return CommonResponse.extend({
    data: BridgeOrderMeta,
  }).parse(response).data;
};

export const getBridgeSupportedChains = async () => {
  const response = await protectedCefiClient.get('v1/bridges/supported-chains').json();

  return CommonResponse.extend({
    data: BridgeSupportedChains,
  }).parse(response).data;
};

export const getBridgeMetaPairs = async () => {
  const response = await protectedCefiClient.get('v1/bridges/meta/pairs').json();

  return CommonResponse.extend({
    data: BridgeMetaPairs,
  }).parse(response).data;
};
