import { CommonResponse } from '@/libs/request/pipes/commans.pipe';

import { protectedCefiClient, publicCefiClient } from '../client';
import type { GetAuthorizeUrlRequest } from '../pipes/users.pipe';
import { AuthorizeUrl, ChangeLocaleRequest, User } from '../pipes/users.pipe';

export const getAuthorizeUrl = async (request: GetAuthorizeUrlRequest) => {
  const response = await publicCefiClient
    .post('v1/users:get-authorize-url', {
      json: request,
    })
    .json();

  return CommonResponse.extend({
    data: AuthorizeUrl,
  }).parse(response).data;
};

export const getMe = async () => {
  const response = await protectedCefiClient.get('v1/me').json();

  return CommonResponse.extend({
    data: User,
  }).parse(response).data;
};

export const changeLocale = async (request: ChangeLocaleRequest) => {
  const parsed = ChangeLocaleRequest.parse(request);
  await protectedCefiClient.post('v1/me:change-locale', {
    json: parsed,
  });
};

export const deleteAccount = async () => {
  await protectedCefiClient.delete('v1/me');
};
