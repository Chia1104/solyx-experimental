import {
  appMigrationKv,
  assetStoreKv,
  cefiAuthKv,
  cefiOnrampKv,
  keychainCacheKv,
  legacyReduxKv,
  queryKv,
  userStoreKv,
} from './instances';

/** Wipes every app MMKV instance (auth, stores, query cache, migration flags, etc.). */
export const clearAllAppKv = () => {
  cefiAuthKv.clearAll();
  cefiOnrampKv.clearAll();
  keychainCacheKv.clearAll();
  queryKv.clearAll();
  userStoreKv.clearAll();
  assetStoreKv.clearAll();
  legacyReduxKv.clearAll();
  appMigrationKv.clearAll();
};
