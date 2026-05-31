import { createMMKV } from 'react-native-mmkv';

/** CeFi OAuth access / refresh tokens */
export const cefiAuthKv = createMMKV({ id: 'cefi-auth' });

/** Coinbase onramp pending order id */
export const cefiOnrampKv = createMMKV({ id: 'cefi-onramp' });

/** Keychain password cache when credentials are not protected by biometrics */
export const keychainCacheKv = createMMKV({ id: 'fontrunaKeychainLocalStorage' });

/** TanStack Query persist cache */
export const queryKv = createMMKV({ id: 'query' });

/** User Zustand persist */
export const userStoreKv = createMMKV({ id: 'user-store' });

/** Asset Zustand persist */
export const assetStoreKv = createMMKV({ id: 'asset-store' });

/** Legacy Redux persist (read during migration) */
export const legacyReduxKv = createMMKV({ id: 'redux-persist' });

/** App migration flags */
export const appMigrationKv = createMMKV({ id: 'app-migration' });
