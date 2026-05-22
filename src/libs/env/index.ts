import { createEnv } from '@t3-oss/env-core';
import * as z from 'zod';

export const env = createEnv({
  client: {
    EXPO_PUBLIC_CEFI_API_URL: z.url(),
    EXPO_PUBLIC_SSO_WEBSITE: z.url(),
    EXPO_PUBLIC_MEDIA_HOST: z.url(),

    EXPO_PUBLIC_WALLET_MASTER_KEY: z.string(),
    EXPO_PUBLIC_WALLET_PRIVATE_KEY_SERVICE: z.string(),
    EXPO_PUBLIC_WALLET_DEFI_PASSWORD_SERVICE: z.string(),
    EXPO_PUBLIC_WALLET_DEFI_PHRASE_SERVICE: z.string(),
    EXPO_PUBLIC_WALLET_BIOMETRY_PRIVATE_KEY_SERVICE: z.string(),
    EXPO_PUBLIC_WALLET_BIOMETRY_DEFI_PASSWORD_SERVICE: z.string(),
    EXPO_PUBLIC_WALLET_BIOMETRY_DEFI_PHRASE_SERVICE: z.string(),
    EXPO_PUBLIC_WALLET_CEFI_TOKEN_SERVICE: z.string(),
    EXPO_PUBLIC_WALLET_CEFI_REFRESH_TOKEN_SERVICE: z.string(),

    EXPO_PUBLIC_APP_ENV: z.string(),
    EXPO_PUBLIC_APP_VERSION: z.string().optional(),
    EXPO_PUBLIC_DEEP_LINK_SCHEME: z.string(),

    EXPO_PUBLIC_EVM_RPC_URL: z.url(),
    EXPO_PUBLIC_TRON_RPC_URL: z.url(),

    EXPO_PUBLIC_SENTRY_DSN: z.string().optional(),

    EXPO_PUBLIC_ONRAMP_ENCRYPTION_PASSPHRASE: z.string(),
    EXPO_PUBLIC_ONRAMP_ENCRYPTION_IV: z.string(),
    EXPO_PUBLIC_ENABLE_COINBASE_ONRAMP: z.string().optional(),

    EXPO_PUBLIC_APP_STORE_URL: z.url(),
    EXPO_PUBLIC_PLAY_STORE_URL: z.url(),

    EXPO_PUBLIC_CIFI_API_PUBLIC_KEY_HASHES: z.string().optional(),
  },
  runtimeEnv: process.env,
  clientPrefix: 'EXPO_PUBLIC_',
  emptyStringAsUndefined: true,
});
