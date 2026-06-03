import { Button, Typography } from 'heroui-native';
import { ProgressBar } from 'heroui-native-pro/progress-bar';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { MigrationStage } from '@/modules/app/enums/migration-stage.enum';
import type { useAppMigration } from '@/modules/app/hooks/use-app-migration';

const stageProgress: Record<MigrationStage, number> = {
  [MigrationStage.Database]: 33,
  [MigrationStage.Legacy]: 66,
  [MigrationStage.Done]: 100,
};

interface MigrationLoadingContentProps {
  migration: ReturnType<typeof useAppMigration>;
}

export const MigrationLoadingContent = ({ migration }: MigrationLoadingContentProps) => {
  const { t } = useTranslation(['global']);

  const stageLabel = {
    [MigrationStage.Database]: t('description.migration.database'),
    [MigrationStage.Legacy]: t('description.migration.legacy'),
    [MigrationStage.Done]: t('description.migration.done'),
  } satisfies Record<MigrationStage, string>;

  return (
    <View className="flex-1 items-center justify-center px-8">
      {migration.error ? (
        <View className="w-full max-w-sm items-center gap-4">
          <Typography className="text-danger text-center" type="h5">
            {t('title.migration.failed')}
          </Typography>
          <Typography className="text-foreground/70 text-center" type="body">
            {t('description.migration.failed')}
          </Typography>
          <Button className="w-full" onPress={migration.retry}>
            <Button.Label>{t('action.retry')}</Button.Label>
          </Button>
        </View>
      ) : (
        <View className="w-full max-w-sm gap-4">
          <ProgressBar
            accessibilityLabel={stageLabel[migration.stage]}
            color="accent"
            size="md"
            value={stageProgress[migration.stage]}
          >
            <View className="mb-2 flex-row items-center justify-between gap-3">
              <ProgressBar.Label>{stageLabel[migration.stage]}</ProgressBar.Label>
              <ProgressBar.ValueLabel />
            </View>
            <ProgressBar.Track>
              <ProgressBar.Fill />
            </ProgressBar.Track>
          </ProgressBar>
        </View>
      )}
    </View>
  );
};
