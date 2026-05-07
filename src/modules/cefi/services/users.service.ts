import { CommonResponse } from '@/modules/request/pipes/commans.pipe';

import { protectedCefiClient } from '../client';
import type { ChangeLocaleRequest } from '../pipes/users.pipe';
import { User } from '../pipes/users.pipe';

export const getMe = async () => {
  const response = await protectedCefiClient.get('v1/me').json();

  return CommonResponse.extend({
    data: User,
  }).parse(response).data;
};

export const changeLocale = async (request: ChangeLocaleRequest) => {
  await protectedCefiClient.post('v1/me:change-locale', {
    json: request,
  });
};

export const deleteAccount = async () => {
  await protectedCefiClient.delete('v1/me');
};
