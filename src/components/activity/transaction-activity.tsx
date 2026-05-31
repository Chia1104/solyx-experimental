import { memo, useCallback, useMemo, useState } from 'react';

import type { LegendListRenderItemProps } from '@legendapp/list/react-native';
import { LegendList } from '@legendapp/list/react-native';
import { Typography } from 'heroui-native';
import { useTranslation } from 'react-i18next';
import { RefreshControl, View } from 'react-native';

import { ActivityDetailSheet } from '@/components/activity/activity-detail-sheet';
import { ActivityExplorerLink } from '@/components/activity/activity-explorer-link';
import { ActivityListItem } from '@/components/activity/activity-list-item';
import { ActivityRecordsLimitNotice } from '@/components/activity/activity-records-limit-notice';
import { useTabBarContentInset } from '@/hooks/use-tab-bar-content-inset';
import type { DefiRecordRow } from '@/modules/database/schema/defi-record.schema';
import { useActivityTransactionList } from '@/modules/defi/hooks/use-activity-transaction-list';
import type { ActivityTransactionListItem } from '@/modules/defi/utils/activity-transaction.utils';
import { activitySectionDateLabel } from '@/modules/defi/utils/activity-transaction.utils';

const LIST_END_REACHED_THRESHOLD = 0.4;
const ESTIMATED_ITEM_SIZE = 68;

interface ActivityListRowProps {
  isLastInSection: boolean;
  onPress: (record: DefiRecordRow) => void;
  record: DefiRecordRow;
}

const ActivityListRow = memo(({ isLastInSection, onPress, record }: ActivityListRowProps) => (
  <View>
    <ActivityListItem onPress={onPress} record={record} />
    {!isLastInSection ? <View className="bg-separator h-px" /> : null}
  </View>
));

ActivityListRow.displayName = 'ActivityListRow';

export const TransactionActivity = () => {
  const { t } = useTranslation(['defi']);
  const [selectedRecord, setSelectedRecord] = useState<DefiRecordRow | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const {
    hasMore,
    isExplorerChain,
    isLoadingMore,
    isRefreshing,
    listData,
    loadMore,
    onRefresh,
    recordsLimit,
    sections,
  } = useActivityTransactionList();
  const tabBarContentInset = useTabBarContentInset(16);

  const handleRecordPress = useCallback((record: DefiRecordRow) => {
    setSelectedRecord(record);
    setIsDetailOpen(true);
  }, []);

  const handleDetailOpenChange = useCallback((open: boolean) => {
    setIsDetailOpen(open);
    if (!open) {
      setSelectedRecord(null);
    }
  }, []);

  const listHeaderComponent = useMemo(
    () => (
      <View className="bg-surface-secondary gap-3 p-4">
        <Typography className="text-default-foreground whitespace-pre-line" type="body-xs">
          {isExplorerChain
            ? t('description.bridgefy.selected.transaction.types.only')
            : t('description.bridgefy.supported.transfers.only')}
        </Typography>
        {isExplorerChain ? (
          <ActivityExplorerLink
            applyEmptySpacing={false}
            buttonLabel={t('description.view.full.history.on.explorer')}
            hasRecords={sections.length > 0}
            showMessage={false}
          />
        ) : null}
      </View>
    ),
    [isExplorerChain, sections.length, t],
  );

  const listFooterComponent = useMemo(() => {
    if (sections.length === 0) {
      return null;
    }

    if (isExplorerChain) {
      return (
        <View className="items-center gap-4 px-6 pt-6 pb-4">
          <ActivityRecordsLimitNotice limit={recordsLimit} />
          <Typography
            className="text-warning-foreground text-center whitespace-pre-line"
            type="body-xs"
          >
            {t('description.missing.transaction.notice')}
          </Typography>
          <ActivityExplorerLink
            applyEmptySpacing={false}
            buttonLabel={t('description.view.full.history.on.explorer')}
            hasRecords
            showMessage={false}
          />
        </View>
      );
    }

    return (
      <View className="items-center px-6 pt-6 pb-4">
        <ActivityRecordsLimitNotice limit={recordsLimit} />
      </View>
    );
  }, [isExplorerChain, recordsLimit, sections.length, t]);

  const listEmptyComponent = useMemo(
    () => (
      <View className="flex-1 items-center justify-center px-6 py-16">
        <Typography className="text-default-soft-hover text-center" type="body-sm">
          {t('description.this.account.no.activity')}
        </Typography>
        <ActivityExplorerLink hasRecords={false} />
      </View>
    ),
    [t],
  );

  const onEndReached = useCallback(() => {
    if (isLoadingMore || !hasMore) {
      return;
    }

    void loadMore();
  }, [hasMore, isLoadingMore, loadMore]);

  const renderItem = useCallback(
    ({ item }: LegendListRenderItemProps<ActivityTransactionListItem>) => {
      if (item.type === 'header') {
        return (
          <View className="bg-surface px-4 py-1.5">
            <Typography className="text-default-foreground" type="body-xs">
              {activitySectionDateLabel(item.title, t)}
            </Typography>
          </View>
        );
      }

      return (
        <ActivityListRow
          isLastInSection={item.isLastInSection}
          onPress={handleRecordPress}
          record={item.record}
        />
      );
    },
    [handleRecordPress, t],
  );

  return (
    <View className="min-h-0 flex-1">
      <LegendList
        contentContainerClassName={sections.length === 0 ? 'min-h-full grow' : undefined}
        contentContainerStyle={{ paddingBottom: tabBarContentInset }}
        data={listData}
        estimatedItemSize={ESTIMATED_ITEM_SIZE}
        getItemType={(item: ActivityTransactionListItem) => item.type}
        keyExtractor={(item: ActivityTransactionListItem) => item.key}
        ListEmptyComponent={listEmptyComponent}
        ListFooterComponent={listFooterComponent}
        ListHeaderComponent={listHeaderComponent}
        recycleItems
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />}
        renderItem={renderItem}
        style={{ flex: 1 }}
        onEndReached={onEndReached}
        onEndReachedThreshold={LIST_END_REACHED_THRESHOLD}
      />
      <ActivityDetailSheet
        isOpen={isDetailOpen}
        onOpenChange={handleDetailOpenChange}
        record={selectedRecord}
      />
    </View>
  );
};
