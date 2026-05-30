// This file is required for Expo/React Native SQLite migrations - https://orm.drizzle.team/quick-sqlite/expo

import m0000 from './20260522191149_init/migration.sql';
import m0001 from './20260523223714_record_index/migration.sql';
import m0002 from './20260530160105_wallet_table/migration.sql';

export default {
  migrations: {
    '20260522191149_init': m0000,
    '20260523223714_record_index': m0001,
    '20260530160105_wallet_table': m0002,
  },
};
