import { env } from '@/libs/env';
import { cefiAuthKv } from '@/modules/kv';

export const cefiToken = {
  getAccessToken: () => cefiAuthKv.getString(env.EXPO_PUBLIC_WALLET_CEFI_TOKEN_SERVICE),
  getRefreshToken: () => cefiAuthKv.getString(env.EXPO_PUBLIC_WALLET_CEFI_REFRESH_TOKEN_SERVICE),
  setAccessToken: (accessToken: string) =>
    cefiAuthKv.set(env.EXPO_PUBLIC_WALLET_CEFI_TOKEN_SERVICE, accessToken),
  setRefreshToken: (refreshToken: string) =>
    cefiAuthKv.set(env.EXPO_PUBLIC_WALLET_CEFI_REFRESH_TOKEN_SERVICE, refreshToken),
  clear: () => {
    cefiAuthKv.remove(env.EXPO_PUBLIC_WALLET_CEFI_TOKEN_SERVICE);
    cefiAuthKv.remove(env.EXPO_PUBLIC_WALLET_CEFI_REFRESH_TOKEN_SERVICE);
  },
};
