import { memo, useCallback } from 'react';

import { Typography } from 'heroui-native';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import { ActivityActionIcon } from '@/components/activity/activity-action-icon';
import { ActivityRecordAmount } from '@/components/activity/activity-record-amount';
import type { ActionKey } from '@/modules/database/enums/defi-record.enum';
import type { DefiRecordRow } from '@/modules/database/schema/defi-record.schema';
import { useDefiAccount } from '@/modules/defi/hooks/use-defi-account';
import {
  getActivityActionLabel,
  isFailedRecord,
  isPendingRecord,
} from '@/modules/defi/utils/activity-transaction.utils';

interface ActivityListItemProps {
  onPress?: (record: DefiRecordRow) => void;
  record: DefiRecordRow;
}

export const ActivityListItem = memo(({ onPress, record }: ActivityListItemProps) => {
  const { t } = useTranslation(['defi']);
  const { chain } = useDefiAccount();
  const actionKey = (record.functionName as ActionKey) || 'contractCall';

  const handlePress = useCallback(() => {
    onPress?.(record);
  }, [onPress, record]);

  return (
    <Pressable className="px-3 py-4" onPress={handlePress}>
      <View className="flex-row items-center justify-between gap-3">
        <View className="min-w-0 flex-1 flex-row items-center gap-3">
          <ActivityActionIcon actionKey={actionKey} />
          <View className="min-w-0 flex-1 gap-1">
            <Typography className="text-foreground text-base" numberOfLines={1}>
              {getActivityActionLabel(actionKey, t)}
            </Typography>
            {isPendingRecord(record) ? (
              <Typography className="text-default-foreground" type="body-xs">
                {t('status.pending')}
              </Typography>
            ) : null}
            {isFailedRecord(record) ? (
              <Typography className="text-danger" type="body-xs">
                {t('status.fail')}
              </Typography>
            ) : null}
          </View>
        </View>

        <ActivityRecordAmount actionKey={actionKey} chain={chain} record={record} />
      </View>
    </Pressable>
  );
});

ActivityListItem.displayName = 'ActivityListItem';
