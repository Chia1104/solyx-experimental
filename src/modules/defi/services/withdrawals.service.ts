import { CommonResponse } from '@/libs/request/pipes/commans.pipe';

import { protectedCefiClient } from '../../cefi/client';
import type {
  DefiWithdrawalCreateRequest,
  DefiWithdrawalEstimateFeeRequest,
  GetDefiWithdrawalDetailRequest,
  GetDefiWithdrawalEventsRequest,
  GetDefiWithdrawalsListRequest,
  ResubmitDefiWithdrawalRequest,
  UpdateDefiWithdrawalRequest,
} from '../pipes/withdrawals.pipe';
import {
  DefiWithdrawalBankInfo,
  DefiWithdrawalDetail,
  DefiWithdrawalEstimateFee,
  DefiWithdrawalEventsResponse,
  DefiWithdrawalsMeta,
  createDefiWithdrawalsListResponse,
} from '../pipes/withdrawals.pipe';

export const getDefiWithdrawalsMeta = async () => {
  const response = await protectedCefiClient.get('v1/defi-withdrawals/meta').json();

  return CommonResponse.extend({
    data: DefiWithdrawalsMeta,
  }).parse(response).data;
};

export const getDefiWithdrawalEstimateFee = async (request: DefiWithdrawalEstimateFeeRequest) => {
  const response = await protectedCefiClient
    .post('v1/defi-withdrawals:get-estimate-fee', {
      json: request,
    })
    .json();

  return CommonResponse.extend({
    data: DefiWithdrawalEstimateFee,
  }).parse(response).data;
};

export const getDefiWithdrawalBankInfo = async () => {
  const response = await protectedCefiClient.post('v1/defi-withdrawals:get-bank-info').json();

  return CommonResponse.extend({
    data: DefiWithdrawalBankInfo,
  }).parse(response).data;
};

export const getDefiWithdrawalEvents = async ({
  id,
  page = 1,
  perPage = 20,
}: GetDefiWithdrawalEventsRequest) => {
  const response = await protectedCefiClient
    .get(`v1/defi-withdrawals/${id}/events`, {
      searchParams: {
        page: page.toString(),
        perPage: perPage.toString(),
      },
    })
    .json();

  return DefiWithdrawalEventsResponse.parse(response);
};

export const getDefiWithdrawalDetail = async ({ id }: GetDefiWithdrawalDetailRequest) => {
  const response = await protectedCefiClient.get(`v1/defi-withdrawals/${id}`).json();

  return CommonResponse.extend({
    data: DefiWithdrawalDetail,
  }).parse(response).data;
};

export const getDefiWithdrawalsList = async (request: GetDefiWithdrawalsListRequest = {}) => {
  const { page = 1, perPage = 20, fromChainId } = request;
  const response = await protectedCefiClient
    .get('v1/defi-withdrawals', {
      searchParams: {
        page: page.toString(),
        perPage: perPage.toString(),
        fromChainId,
      },
    })
    .json();

  return createDefiWithdrawalsListResponse(perPage).parse(response);
};

export const createDefiWithdrawal = async (request: DefiWithdrawalCreateRequest) => {
  const response = await protectedCefiClient
    .post('v1/defi-withdrawals', {
      json: request,
    })
    .json();

  return CommonResponse.extend({
    data: DefiWithdrawalDetail,
  }).parse(response).data;
};

export const updateDefiWithdrawal = async ({ id, body }: UpdateDefiWithdrawalRequest) => {
  const response = await protectedCefiClient
    .patch(`v1/defi-withdrawals/${id}`, {
      json: body,
    })
    .json();

  return CommonResponse.extend({
    data: DefiWithdrawalDetail,
  }).parse(response).data;
};

export const resubmitDefiWithdrawal = async ({ id, body }: ResubmitDefiWithdrawalRequest) => {
  const response = await protectedCefiClient
    .post(`v1/defi-withdrawals/${id}:resubmit`, {
      json: body,
    })
    .json();

  return CommonResponse.extend({
    data: DefiWithdrawalDetail,
  }).parse(response).data;
};
