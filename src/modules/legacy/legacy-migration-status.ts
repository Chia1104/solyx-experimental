import { appMigrationKv } from '@/modules/kv';

const LEGACY_REDUX_MIGRATED_KEY = 'legacy-redux-migrated';

export const isLegacyReduxMigrated = () =>
  appMigrationKv.getBoolean(LEGACY_REDUX_MIGRATED_KEY) ?? false;

export const markLegacyReduxMigrated = () => {
  appMigrationKv.set(LEGACY_REDUX_MIGRATED_KEY, true);
};
