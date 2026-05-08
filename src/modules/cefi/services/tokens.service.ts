import { CommonResponse } from '@/libs/request/pipes/commans.pipe';

import { publicCefiClient } from '../client';
import type { RefreshTokenRequest, SignInRequest } from '../pipes/tokens.pipe';
import { CefiAuthTokens } from '../pipes/tokens.pipe';

export const signIn = async (request: SignInRequest) => {
  const response = await publicCefiClient
    .post('v1/tokens', {
      json: request,
    })
    .json();

  return CommonResponse.extend({
    data: CefiAuthTokens,
  }).parse(response).data;
};

export const refreshToken = async (request: RefreshTokenRequest) => {
  const response = await publicCefiClient
    .post('v1/tokens:refresh', {
      json: request,
    })
    .json();

  return CommonResponse.extend({
    data: CefiAuthTokens,
  }).parse(response).data;
};
