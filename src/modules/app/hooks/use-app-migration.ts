import { useCallback } from 'react';

import { queryOptions, useQuery } from '@tanstack/react-query';
import { useMigrations } from 'drizzle-orm/expo-sqlite/migrator';

import { MigrationStage } from '@/modules/app/enums/migration-stage.enum';
import { db } from '@/modules/database/client';
import { migrateLegacyReduxStore } from '@/modules/legacy/services/legacy-redux-migration';

import migrations from '../../../../.drizzle/migrations';

export const queryLegacyReduxMigrationOptions = () =>
  queryOptions({
    queryKey: ['app', 'migration', 'legacy-redux'],
    queryFn: migrateLegacyReduxStore,
    gcTime: Infinity,
    retry: false,
    staleTime: Infinity,
  });

export const useAppMigration = () => {
  // @ts-expect-error - expo migrator bundle shape differs from drizzle type definition
  const { success: dbMigrationSuccess, error: dbMigrationError } = useMigrations(db, migrations);

  const {
    error: legacyMigrationError,
    isFetching: isLegacyMigrationFetching,
    isPending: isLegacyMigrationPending,
    isSuccess: isLegacyMigrationSuccess,
    refetch: refetchLegacyMigration,
  } = useQuery({
    ...queryLegacyReduxMigrationOptions(),
    enabled: Boolean(dbMigrationSuccess),
  });

  const retry = useCallback(() => {
    if (!dbMigrationSuccess) {
      return;
    }

    void refetchLegacyMigration();
  }, [dbMigrationSuccess, refetchLegacyMigration]);

  const isComplete = Boolean(dbMigrationSuccess) && isLegacyMigrationSuccess;
  const isLoading = !dbMigrationSuccess || isLegacyMigrationPending || isLegacyMigrationFetching;

  return {
    error: dbMigrationError ?? legacyMigrationError,
    isComplete,
    isLoading,
    retry,
    stage: !dbMigrationSuccess
      ? MigrationStage.Database
      : isLegacyMigrationSuccess
        ? MigrationStage.Done
        : MigrationStage.Legacy,
  };
};
