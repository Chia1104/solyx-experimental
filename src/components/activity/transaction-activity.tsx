import type { ReactElement, ReactNode } from 'react';
import { createContext, memo, use, useCallback, useMemo, useState } from 'react';

import type { LegendListRenderItemProps } from '@legendapp/list/react-native';
import { LegendList } from '@legendapp/list/react-native';
import { useIsFocused } from 'expo-router';
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
import { useDefiAccount } from '@/modules/defi/hooks/use-defi-account';
import type { ActivityTransactionListItem } from '@/modules/defi/utils/activity-transaction.utils';
import { activitySectionDateLabel } from '@/modules/defi/utils/activity-transaction.utils';

const LIST_END_REACHED_THRESHOLD = 0.4;
const ESTIMATED_ITEM_SIZE = 68;
const LOADING_SKELETON_ROW_COUNT = 5;

// ─────────────────────────────────────────────────────────────────────────────
// Context — list data and detail-sheet control shared by compound parts
// ─────────────────────────────────────────────────────────────────────────────

type ActivityListHookResult = ReturnType<typeof useActivityTransactionList>;

interface TransactionActivityContextValue extends Pick<
  ActivityListHookResult,
  'hasMore' | 'isExplorerChain' | 'isLoadingMore' | 'listData' | 'loadMore' | 'recordsLimit'
> {
  hasRecords: boolean;
  isListLoading: boolean;
  isRefreshing: boolean;
  onRefresh: () => void;
  openDetail: (record: DefiRecordRow) => void;
}

const TransactionActivityContext = createContext<TransactionActivityContextValue | null>(null);

const useTransactionActivity = () => {
  const context = use(TransactionActivityContext);
  if (!context) {
    throw new Error(
      'TransactionActivity compound components must be used within <TransactionActivity>',
    );
  }

  return context;
};

// ─────────────────────────────────────────────────────────────────────────────
// List rows
// ─────────────────────────────────────────────────────────────────────────────

const ActivitySectionHeader = memo(({ title }: { title: string }) => {
  const { t } = useTranslation(['defi']);

  return (
    <View className="bg-surface px-4 py-1.5">
      <Typography className="text-default-foreground" type="body-xs">
        {activitySectionDateLabel(title, t)}
      </Typography>
    </View>
  );
});

ActivitySectionHeader.displayName = 'ActivitySectionHeader';

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

// ─────────────────────────────────────────────────────────────────────────────
// Empty / loading states
// ─────────────────────────────────────────────────────────────────────────────

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

// ─────────────────────────────────────────────────────────────────────────────
// TransactionActivity.Notice — supported-transfers notice, header slot content
// ─────────────────────────────────────────────────────────────────────────────

const TransactionActivityNotice = memo(() => {
  const { t } = useTranslation(['defi']);
  const { hasRecords, isExplorerChain } = useTransactionActivity();

  return (
    <View className="bg-surface-secondary gap-3 px-4 py-4">
      <Typography className="text-default-foreground text-left whitespace-pre-line" type="body-xs">
        {isExplorerChain
          ? t('description.bridgefy.selected.transaction.types.only')
          : t('description.bridgefy.supported.transfers.only')}
      </Typography>
      {isExplorerChain ? (
        <ActivityExplorerLink
          align="start"
          applyEmptySpacing={false}
          buttonLabel={t('description.view.full.history.on.explorer')}
          hasRecords={hasRecords}
          showMessage={false}
        />
      ) : null}
    </View>
  );
});

TransactionActivityNotice.displayName = 'TransactionActivityNotice';

// ─────────────────────────────────────────────────────────────────────────────
// TransactionActivity.RecordsLimitFooter / .ExplorerFooter — footer slot content
// ─────────────────────────────────────────────────────────────────────────────

const TransactionActivityRecordsLimitFooter = memo(() => {
  const { t } = useTranslation(['defi']);
  const { isExplorerChain, recordsLimit } = useTransactionActivity();

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
});

TransactionActivityRecordsLimitFooter.displayName = 'TransactionActivityRecordsLimitFooter';

const TransactionActivityExplorerFooter = memo(() => <ActivityExplorerLink hasRecords />);

TransactionActivityExplorerFooter.displayName = 'TransactionActivityExplorerFooter';

// ─────────────────────────────────────────────────────────────────────────────
// TransactionActivity.List — virtualized record list with header/footer slots
// ─────────────────────────────────────────────────────────────────────────────

const getListItemType = (item: ActivityTransactionListItem) => item.type;
const listItemKeyExtractor = (item: ActivityTransactionListItem) => item.key;

interface TransactionActivityListProps {
  contentInsetBottom?: number;
  contentInsetTop?: number;
  emptyText?: string;
  /** Rendered below the last record; hidden while the list is empty. */
  footer?: ReactElement | null;
  /** Rendered above the first record, scrolls with the list. */
  header?: ReactElement | null;
}

const TransactionActivityList = ({
  contentInsetBottom,
  contentInsetTop = 0,
  emptyText,
  footer,
  header,
}: TransactionActivityListProps) => {
  const {
    hasMore,
    hasRecords,
    isExplorerChain,
    isListLoading,
    isLoadingMore,
    isRefreshing,
    listData,
    loadMore,
    onRefresh,
    openDetail,
  } = useTransactionActivity();
  const tabBarContentInset = useTabBarContentInset(16);
  const bottomInset = contentInsetBottom ?? tabBarContentInset;

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
        return <ActivitySectionHeader title={item.title} />;
      }

      return (
        <ActivityListRow
          isLastInSection={item.isLastInSection}
          onPress={openDetail}
          record={item.record}
        />
      );
    },
    [openDetail],
  );

  return (
    <LegendList
      contentContainerClassName={!hasRecords ? 'min-h-full grow' : undefined}
      contentContainerStyle={{ paddingBottom: bottomInset, paddingTop: contentInsetTop }}
      data={listData}
      estimatedItemSize={ESTIMATED_ITEM_SIZE}
      getItemType={getListItemType}
      keyExtractor={listItemKeyExtractor}
      ListEmptyComponent={listEmptyComponent}
      ListFooterComponent={hasRecords ? footer : null}
      ListHeaderComponent={header}
      recycleItems
      refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />}
      renderItem={renderItem}
      style={{ flex: 1 }}
      onEndReached={onEndReached}
      onEndReachedThreshold={LIST_END_REACHED_THRESHOLD}
    />
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// TransactionActivity — root: runs the list hook, owns detail-sheet state
// ─────────────────────────────────────────────────────────────────────────────

export interface TransactionActivityProps {
  children: ReactNode;
  currencySymbol?: string;
  /** Extra refresh work on pull-to-refresh; the spinner stays visible until it settles. */
  extraRefresh?: () => Promise<unknown>;
}

const TransactionActivityRoot = ({
  children,
  currencySymbol,
  extraRefresh,
}: TransactionActivityProps) => {
  const isFocused = useIsFocused();
  const { chain, chainType, currentAddress, isEVM, wallet } = useDefiAccount();
  const [selectedRecord, setSelectedRecord] = useState<DefiRecordRow | null>(null);
  const [isExtraRefreshing, setIsExtraRefreshing] = useState(false);
  const {
    hasMore,
    isExplorerChain,
    isLoading,
    isLoadingMore,
    isRefreshing: isSyncRefreshing,
    listData,
    loadMore,
    onRefresh: onSyncRefresh,
    recordsLimit,
    sections,
  } = useActivityTransactionList({ currencySymbol, enable: isFocused });

  const isRefreshing = isSyncRefreshing || isExtraRefreshing;
  const hasRecords = sections.length > 0;
  const isListLoading = !hasRecords && (isLoading || isRefreshing);

  const onRefresh = useCallback(() => {
    onSyncRefresh();
    if (!extraRefresh) {
      return;
    }

    setIsExtraRefreshing(true);
    void extraRefresh().finally(() => setIsExtraRefreshing(false));
  }, [extraRefresh, onSyncRefresh]);

  const openDetail = useCallback((record: DefiRecordRow) => {
    setSelectedRecord(record);
  }, []);

  const handleDetailOpenChange = useCallback((open: boolean) => {
    if (!open) {
      setSelectedRecord(null);
    }
  }, []);

  const contextValue = useMemo<TransactionActivityContextValue>(
    () => ({
      hasMore,
      hasRecords,
      isExplorerChain,
      isListLoading,
      isLoadingMore,
      isRefreshing,
      listData,
      loadMore,
      onRefresh,
      openDetail,
      recordsLimit,
    }),
    [
      hasMore,
      hasRecords,
      isExplorerChain,
      isListLoading,
      isLoadingMore,
      isRefreshing,
      listData,
      loadMore,
      onRefresh,
      openDetail,
      recordsLimit,
    ],
  );

  return (
    <TransactionActivityContext value={contextValue}>
      <View className="min-h-0 flex-1">
        {children}
        <ActivityDetailSheet
          chain={chain}
          chainType={chainType}
          currentAddress={currentAddress}
          isEVM={isEVM}
          isOpen={selectedRecord !== null}
          onOpenChange={handleDetailOpenChange}
          record={selectedRecord}
          walletName={wallet?.name}
        />
      </View>
    </TransactionActivityContext>
  );
};

export const TransactionActivity = Object.assign(TransactionActivityRoot, {
  /** Explorer-link-only footer for screens that hide the records-limit copy. */
  ExplorerFooter: TransactionActivityExplorerFooter,
  /** The virtualized record list — required child. */
  List: TransactionActivityList,
  /** Supported-transfers notice, pass to the List `header` slot. */
  Notice: TransactionActivityNotice,
  /** Records-limit copy (+ explorer link on explorer chains), pass to the List `footer` slot. */
  RecordsLimitFooter: TransactionActivityRecordsLimitFooter,
});
