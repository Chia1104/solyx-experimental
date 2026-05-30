import { createMMKV } from 'react-native-mmkv';

const migrationStorage = createMMKV({
  id: 'app-migration',
});

const LEGACY_REDUX_MIGRATED_KEY = 'legacy-redux-migrated';

export const isLegacyReduxMigrated = () =>
  migrationStorage.getBoolean(LEGACY_REDUX_MIGRATED_KEY) ?? false;

export const markLegacyReduxMigrated = () => {
  migrationStorage.set(LEGACY_REDUX_MIGRATED_KEY, true);
};
