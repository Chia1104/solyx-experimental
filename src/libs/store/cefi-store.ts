import { createMMKV } from 'react-native-mmkv';

import { env } from '../env';

export const cefiAuthStorage = createMMKV({
  id: 'cefi-auth',
});

export const cefiToken = {
  getAccessToken: () => cefiAuthStorage.getString(env.EXPO_PUBLIC_WALLET_CEFI_TOKEN_SERVICE),
  getRefreshToken: () =>
    cefiAuthStorage.getString(env.EXPO_PUBLIC_WALLET_CEFI_REFRESH_TOKEN_SERVICE),
  setAccessToken: (accessToken: string) =>
    cefiAuthStorage.set(env.EXPO_PUBLIC_WALLET_CEFI_TOKEN_SERVICE, accessToken),
  setRefreshToken: (refreshToken: string) =>
    cefiAuthStorage.set(env.EXPO_PUBLIC_WALLET_CEFI_REFRESH_TOKEN_SERVICE, refreshToken),
  clear: () => {
    cefiAuthStorage.remove(env.EXPO_PUBLIC_WALLET_CEFI_TOKEN_SERVICE);
    cefiAuthStorage.remove(env.EXPO_PUBLIC_WALLET_CEFI_REFRESH_TOKEN_SERVICE);
  },
};
