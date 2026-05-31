import { memo } from 'react';

import { Typography } from 'heroui-native';
import { NumberValue } from 'heroui-native-pro/number-value';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

interface ActivityRecordsLimitNoticeProps {
  limit: number;
}

export const ActivityRecordsLimitNotice = memo(({ limit }: ActivityRecordsLimitNoticeProps) => {
  const { i18n, t } = useTranslation(['defi']);

  return (
    <View className="flex-row flex-wrap items-center justify-center">
      <Typography className="text-muted text-center" type="body-xs">
        {t('description.recent.records.limit.prefix')}
      </Typography>
      <NumberValue
        classNames={{ value: 'text-muted text-xs' }}
        locale={i18n.language}
        maximumFractionDigits={0}
        value={limit}
      />
      <Typography className="text-muted text-center" type="body-xs">
        {t('description.recent.records.limit.suffix')}
      </Typography>
    </View>
  );
});

ActivityRecordsLimitNotice.displayName = 'ActivityRecordsLimitNotice';
