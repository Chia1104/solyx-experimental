import type { ReactNode } from 'react';
import { memo, useCallback, useMemo, useState } from 'react';

import type { LegendListRenderItemProps } from '@legendapp/list/react-native';
import { LegendList } from '@legendapp/list/react-native';
import { Separator, Skeleton, Typography } from 'heroui-native';
import { EmptyState } from 'heroui-native-pro/empty-state';
import { useTranslation } from 'react-i18next';
import { RefreshControl, View } from 'react-native';

import { ActivityDetailSheet } from '@/components/activity/activity-detail-sheet';
import { ActivityExplorerLink } from '@/components/activity/activity-explorer-link';
import { ActivityListItem } from '@/components/activity/activity-list-item';
import { ThemedIcon } from '@/components/ui/themed-icon';
import { useTabBarContentInset } from '@/hooks/use-tab-bar-content-inset';
import type { DefiRecordRow } from '@/modules/database/schema/defi-record.schema';
import { useActivityTransactionList } from '@/modules/defi/hooks/use-activity-transaction-list';
import type { ActivityTransactionListItem } from '@/modules/defi/utils/activity-transaction.utils';
import { activitySectionDateLabel } from '@/modules/defi/utils/activity-transaction.utils';

const LIST_END_REACHED_THRESHOLD = 0.4;
const ESTIMATED_ITEM_SIZE = 68;
const LOADING_SKELETON_ROW_COUNT = 5;

interface ActivityListRowProps {
  isLastInSection: boolean;
  onPress: (record: DefiRecordRow) => void;
  record: DefiRecordRow;
}

const ActivityListRow = memo(({ isLastInSection, onPress, record }: ActivityListRowProps) => (
  <View>
    <ActivityListItem onPress={onPress} record={record} />
    {!isLastInSection ? <Separator /> : null}
  </View>
));

ActivityListRow.displayName = 'ActivityListRow';

interface TransactionActivityEmptyStateProps {
  emptyText?: string;
  showExplorerAction: boolean;
}

const TransactionActivityEmptyState = memo(
  ({ emptyText, showExplorerAction }: TransactionActivityEmptyStateProps) => {
    const { t } = useTranslation(['defi']);

    return (
      <EmptyState className="flex-1 justify-center px-6 py-16">
        <EmptyState.Header>
          <EmptyState.Media variant="icon">
            <ThemedIcon className="text-muted" name="receipt-outline" size={20} />
          </EmptyState.Media>
          <EmptyState.Title>
            {emptyText ?? t('description.this.account.no.activity')}
          </EmptyState.Title>
          {showExplorerAction ? (
            <EmptyState.Description>{t('action.need.more')}</EmptyState.Description>
          ) : null}
        </EmptyState.Header>
        {showExplorerAction ? (
          <EmptyState.Content>
            <ActivityExplorerLink
              applyEmptySpacing={false}
              hasRecords={false}
              showMessage={false}
            />
          </EmptyState.Content>
        ) : null}
      </EmptyState>
    );
  },
);

TransactionActivityEmptyState.displayName = 'TransactionActivityEmptyState';

const TransactionActivityLoadingState = memo(() => (
  <View>
    <View className="bg-surface px-4 py-1.5">
      <Skeleton className="h-4 w-24 rounded-md" />
    </View>
    {Array.from({ length: LOADING_SKELETON_ROW_COUNT }).map((_, index) => (
      <View key={index}>
        <View className="flex-row items-center justify-between gap-3 px-3 py-4">
          <View className="min-w-0 flex-1 flex-row items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <Skeleton className="h-5 w-24 rounded-md" />
          </View>
          <Skeleton className="h-5 w-20 rounded-md" />
        </View>
        {index < LOADING_SKELETON_ROW_COUNT - 1 ? <Separator /> : null}
      </View>
    ))}
  </View>
));

TransactionActivityLoadingState.displayName = 'TransactionActivityLoadingState';

export interface TransactionActivityProps {
  contentInsetBottom?: number;
  contentInsetTop?: number;
  currencySymbol?: string;
  emptyText?: string;
  headerComponent?: ReactNode;
  onRefresh?: () => void;
  refreshing?: boolean;
  showTransactionNotice?: boolean;
  showRecordsLimitFooter?: boolean;
}

export const TransactionActivity = ({
  contentInsetBottom,
  contentInsetTop = 0,
  currencySymbol,
  emptyText,
  headerComponent,
  onRefresh: onRefreshProp,
  refreshing: refreshingProp,
  showTransactionNotice = true,
  showRecordsLimitFooter = true,
}: TransactionActivityProps = {}) => {
  const { t } = useTranslation(['defi']);
  const [selectedRecord, setSelectedRecord] = useState<DefiRecordRow | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const {
    hasMore,
    isExplorerChain,
    isLoading,
    isLoadingMore,
    isRefreshing: isRefreshingFromHook,
    listData,
    loadMore,
    onRefresh: onRefreshFromHook,
    recordsLimit,
    sections,
  } = useActivityTransactionList({ currencySymbol });
  const tabBarContentInset = useTabBarContentInset(16);
  const bottomInset = contentInsetBottom ?? tabBarContentInset;
  const isRefreshing = refreshingProp ?? isRefreshingFromHook;
  const onRefresh = onRefreshProp ?? onRefreshFromHook;
  const isListLoading = sections.length === 0 && (isLoading || isRefreshing);

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

  const listHeaderComponent = useMemo(() => {
    const notice = showTransactionNotice ? (
      <View className="bg-surface-secondary gap-3 px-4 py-4">
        <Typography
          className="text-default-foreground text-left whitespace-pre-line"
          type="body-xs"
        >
          {isExplorerChain
            ? t('description.bridgefy.selected.transaction.types.only')
            : t('description.bridgefy.supported.transfers.only')}
        </Typography>
        {isExplorerChain ? (
          <ActivityExplorerLink
            align="start"
            applyEmptySpacing={false}
            buttonLabel={t('description.view.full.history.on.explorer')}
            hasRecords={sections.length > 0}
            showMessage={false}
          />
        ) : null}
      </View>
    ) : null;

    if (!headerComponent && !notice) {
      return null;
    }

    return (
      <>
        {headerComponent}
        {notice}
      </>
    );
  }, [headerComponent, isExplorerChain, sections.length, showTransactionNotice, t]);

  const listFooterComponent = useMemo(() => {
    if (sections.length === 0) {
      return null;
    }

    if (!showRecordsLimitFooter) {
      return <ActivityExplorerLink hasRecords />;
    }

    if (isExplorerChain) {
      return (
        <View className="items-center px-6 pt-6 pb-2.5">
          <Typography className="text-muted text-center" type="body-xs">
            {t('description.recent.records.limit.only', { count: recordsLimit })}
          </Typography>
          <Typography
            className="text-warning-foreground mt-6 text-center whitespace-pre-line"
            type="body-xs"
          >
            {t('description.missing.transaction.notice')}
          </Typography>
          <ActivityExplorerLink
            applyEmptySpacing={false}
            buttonLabel={t('description.view.full.history.on.explorer')}
            className="mt-6"
            hasRecords
            showMessage={false}
          />
        </View>
      );
    }

    return (
      <View className="items-center px-6 pt-6 pb-2.5">
        <Typography className="text-muted text-center" type="body-xs">
          {t('description.recent.records.limit.only', { count: recordsLimit })}
        </Typography>
      </View>
    );
  }, [isExplorerChain, recordsLimit, sections.length, showRecordsLimitFooter, t]);

  const listEmptyComponent = useMemo(() => {
    if (isListLoading) {
      return <TransactionActivityLoadingState />;
    }

    return (
      <TransactionActivityEmptyState emptyText={emptyText} showExplorerAction={isExplorerChain} />
    );
  }, [emptyText, isExplorerChain, isListLoading]);

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
        contentContainerStyle={{ paddingBottom: bottomInset, paddingTop: contentInsetTop }}
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
