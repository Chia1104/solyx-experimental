import Constants from 'expo-constants';
import * as Device from 'expo-device';
import ky from 'ky';

import { env } from '../env';
import { cefiToken } from '../store/cefi-store';

interface CefiAuthTokens {
  accessToken: string;
  refreshToken: string;
}

interface RefreshTokenResponse {
  data?: Partial<CefiAuthTokens>;
}

let refreshTokenPromise: Promise<boolean> | undefined;

const getDeviceInfoHeader = () => {
  const appVersion = env.EXPO_PUBLIC_APP_VERSION ?? Constants.expoConfig?.version ?? 'unknown';
  const osName = Device.osName ?? 'unknown';
  const osVersion = Device.osVersion ?? 'unknown';

  return `${appVersion}/${osName}/${osVersion}`;
};

export const publicCefiClient = ky.create({
  prefix: env.EXPO_PUBLIC_CEFI_API_URL,
  headers: {
    Accept: 'application/json',
    'X-Device-Info': getDeviceInfoHeader(),
  },
});

const createRequestWithAccessToken = (request: Request, accessToken: string) => {
  const headers = new Headers(request.headers);
  headers.set('Authorization', `Bearer ${accessToken}`);

  return new Request(request, { headers });
};

const refreshCefiAccessToken = () => {
  if (refreshTokenPromise) {
    return refreshTokenPromise;
  }

  refreshTokenPromise = (async () => {
    const refreshToken = cefiToken.getRefreshToken();

    if (!refreshToken) {
      cefiToken.clear();
      return false;
    }

    try {
      const response = await publicCefiClient
        .post<RefreshTokenResponse>('v1/tokens:refresh', {
          json: { refreshToken },
        })
        .json();
      const { accessToken, refreshToken: nextRefreshToken } = response.data ?? {};

      if (!accessToken || !nextRefreshToken) {
        cefiToken.clear();
        return false;
      }

      cefiToken.setAccessToken(accessToken);
      cefiToken.setRefreshToken(nextRefreshToken);

      return true;
    } catch {
      cefiToken.clear();
      return false;
    } finally {
      refreshTokenPromise = undefined;
    }
  })();

  return refreshTokenPromise;
};

export const protectedCefiClient = ky.create({
  prefix: env.EXPO_PUBLIC_CEFI_API_URL,
  retry: {
    limit: 1,
    methods: ['get', 'post', 'put', 'patch', 'delete', 'head'],
    statusCodes: [],
  },
  hooks: {
    beforeRequest: [
      async ({ request }) => {
        if (refreshTokenPromise) {
          await refreshTokenPromise;
        }

        request.headers.set('Accept', 'application/json');
        request.headers.set('X-Device-Info', getDeviceInfoHeader());

        const accessToken = cefiToken.getAccessToken();

        if (accessToken) {
          request.headers.set('Authorization', `Bearer ${accessToken}`);
        }
      },
    ],
    afterResponse: [
      async ({ request, response, retryCount }) => {
        if (response.status !== 401 || retryCount > 0) {
          return;
        }

        const refreshed = await refreshCefiAccessToken();
        const accessToken = cefiToken.getAccessToken();

        if (!refreshed || !accessToken) {
          return;
        }

        return ky.retry({
          code: 'CEFI_TOKEN_REFRESHED',
          request: createRequestWithAccessToken(request, accessToken),
        });
      },
    ],
  },
});
