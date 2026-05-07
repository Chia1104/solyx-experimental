import { CommonResponse } from '@/modules/request/pipes/commans.pipe';

import { protectedCefiClient } from '../client';
import type { KYCProfileUpsertRequest, KYCUploadURLRequest } from '../pipes/kyc.pipe';
import { KYCProfile, KYCUploadURL } from '../pipes/kyc.pipe';

export const getKYCProfile = async () => {
  const response = await protectedCefiClient.get('v1/kyc-profile').json();

  return CommonResponse.extend({
    data: KYCProfile,
  }).parse(response).data;
};

export const getKYCUploadURL = async (request: KYCUploadURLRequest) => {
  const response = await protectedCefiClient
    .post('v1/kyc-profile:get-upload-url', {
      json: request,
    })
    .json();

  return CommonResponse.extend({
    data: KYCUploadURL,
  }).parse(response).data;
};

export const upsertKYCProfile = async (request: KYCProfileUpsertRequest) => {
  await protectedCefiClient.post('v1/kyc-profile:upsert', {
    json: request,
  });
};
