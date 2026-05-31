import { memo, useCallback, useEffect, useMemo, useState } from 'react';

import type { LegendListRenderItemProps } from '@legendapp/list/react-native';
import { LegendList } from '@legendapp/list/react-native';
import dayjs from 'dayjs';
import isToday from 'dayjs/plugin/isToday';
import isYesterday from 'dayjs/plugin/isYesterday';
import { Spinner, Typography } from 'heroui-native';
import { EmptyState } from 'heroui-native-pro/empty-state';
import { useTranslation } from 'react-i18next';
import { RefreshControl, View } from 'react-native';

import { BuyActivityListItem } from '@/components/activity/buy-activity-list-item';
import { OnrampOrderDetailSheet } from '@/components/activity/onramp-order-detail-sheet';
import { ThemedIcon } from '@/components/ui/themed-icon';
import { useTabBarContentInset } from '@/hooks/use-tab-bar-content-inset';
import { cefiToken } from '@/modules/cefi/cefi-store';
import { useQueryOnrampOrder } from '@/modules/cefi/hooks/use-query-onramp-order';
import { useQueryOnrampOrders } from '@/modules/cefi/hooks/use-query-onramp-orders';
import type { OnrampOrderListItem } from '@/modules/cefi/pipes/onramp.pipe';

dayjs.extend(isToday);
dayjs.extend(isYesterday);

const PER_PAGE = 20;
const ESTIMATED_ITEM_SIZE = 72;
const LIST_END_REACHED_THRESHOLD = 0.3;

interface OrderSection {
  title: string;
  dateKey: string;
  data: OnrampOrderListItem[];
}

type BuyActivityListRow =
  | {
      key: string;
      section: OrderSection;
      type: 'header';
    }
  | {
      isLastInSection: boolean;
      item: OnrampOrderListItem;
      key: string;
      type: 'order';
    };

const groupOrdersByDate = (
  orders: OnrampOrderListItem[],
  todayLabel: string,
  yesterdayLabel: string,
): OrderSection[] => {
  const grouped: Record<string, OnrampOrderListItem[]> = {};

  orders.forEach(order => {
    const dateKey = dayjs(order.createdAt).format('YYYY-MM-DD');
    grouped[dateKey] ??= [];
    grouped[dateKey].push(order);
  });

  const sortedKeys = Object.keys(grouped).sort((a, b) => dayjs(b).diff(dayjs(a)));

  return sortedKeys.map(dateKey => {
    const date = dayjs(dateKey);
    let title: string;

    if (date.isToday()) {
      title = todayLabel;
    } else if (date.isYesterday()) {
      title = yesterdayLabel;
    } else {
      title = date.format('MMM DD, YYYY');
    }

    return {
      title,
      dateKey,
      data: grouped[dateKey],
    };
  });
};

export interface BuyActivityProps {
  onPendingOrderHandled?: () => void;
  pendingOrderId?: string;
}

export const BuyActivity = memo(({ onPendingOrderHandled, pendingOrderId }: BuyActivityProps) => {
  const { t } = useTranslation(['defi', 'global', 'cefi']);
  const contentInsetBottom = useTabBarContentInset();
  const hasCefiToken = Boolean(cefiToken.getAccessToken());

  const [page, setPage] = useState(1);
  const [refreshing, setRefreshing] = useState(false);
  const [allOrders, setAllOrders] = useState<OnrampOrderListItem[]>([]);
  const [detailOrderId, setDetailOrderId] = useState<string | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const ordersQuery = useQueryOnrampOrders(
    {
      finPerPage: PER_PAGE,
      finPage: page.toString(),
    },
    { enabled: hasCefiToken },
  );

  const pendingOrderQuery = useQueryOnrampOrder(
    { orderId: pendingOrderId!, syncWithProvider: true },
    { enabled: Boolean(pendingOrderId && hasCefiToken) },
  );

  useEffect(() => {
    if (!pendingOrderId || !pendingOrderQuery.data) {
      return;
    }

    setDetailOrderId(pendingOrderId);
    setIsDetailOpen(true);
    void ordersQuery.refetch();
    onPendingOrderHandled?.();
  }, [onPendingOrderHandled, ordersQuery, pendingOrderId, pendingOrderQuery.data]);

  useEffect(() => {
    const pageData = ordersQuery.data?.data;

    if (!pageData) {
      return;
    }

    if (page === 1) {
      setAllOrders(pageData);
      return;
    }

    setAllOrders(previous => {
      const existingIds = new Set(previous.map(order => String(order.id)));
      const newOrders = pageData.filter(order => !existingIds.has(String(order.id)));

      return [...previous, ...newOrders];
    });
  }, [ordersQuery.data?.data, page]);

  const sections = useMemo(
    () => groupOrdersByDate(allOrders, t('global:unit.today'), t('global:unit.yesterday')),
    [allOrders, t],
  );

  const listData = useMemo(
    () =>
      sections.flatMap<BuyActivityListRow>(section => [
        {
          key: `header-${section.dateKey}`,
          section,
          type: 'header',
        },
        ...section.data.map((item, index) => ({
          isLastInSection: index === section.data.length - 1,
          item,
          key: `order-${String(item.id)}`,
          type: 'order' as const,
        })),
      ]),
    [sections],
  );

  const hasMore = useMemo(() => {
    const meta = ordersQuery.data?.meta;

    if (!meta) {
      return false;
    }

    return meta.currentPage < meta.totalPages;
  }, [ordersQuery.data?.meta]);

  const handleLoadMore = useCallback(() => {
    if (!ordersQuery.isFetching && hasMore) {
      setPage(previous => previous + 1);
    }
  }, [hasMore, ordersQuery.isFetching]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    setPage(1);

    try {
      const result = await ordersQuery.refetch();
      setAllOrders(result.data?.data ?? []);
    } finally {
      setRefreshing(false);
    }
  }, [ordersQuery]);

  const openOrderDetail = useCallback((orderId: string) => {
    setDetailOrderId(orderId);
    setIsDetailOpen(true);
  }, []);

  const renderItem = useCallback(
    ({ item }: LegendListRenderItemProps<BuyActivityListRow>) => {
      if (item.type === 'header') {
        return (
          <View className="bg-surface px-4 py-1.5">
            <Typography className="text-muted" type="body-sm">
              {item.section.title}
            </Typography>
          </View>
        );
      }

      return (
        <View>
          <BuyActivityListItem data={item.item} onPress={openOrderDetail} />
          {!item.isLastInSection ? <View className="bg-separator h-px" /> : null}
        </View>
      );
    },
    [openOrderDetail],
  );

  const listEmpty = useMemo(() => {
    if (ordersQuery.isLoading) {
      return (
        <View className="flex-1 items-center justify-center py-16">
          <Spinner size="lg" />
        </View>
      );
    }

    return (
      <EmptyState className="flex-1 justify-center px-6 py-16">
        <EmptyState.Header>
          <EmptyState.Media variant="icon">
            <ThemedIcon className="text-muted" name="receipt-outline" size={20} />
          </EmptyState.Media>
          <EmptyState.Title>{t('description.this.account.no.activity')}</EmptyState.Title>
        </EmptyState.Header>
      </EmptyState>
    );
  }, [ordersQuery.isLoading, t]);

  const listFooter = useMemo(() => {
    if (ordersQuery.isFetching && page > 1) {
      return (
        <View className="items-center py-4">
          <Spinner size="sm" />
        </View>
      );
    }

    if (!hasMore && allOrders.length > 0) {
      return (
        <View className="items-center py-4">
          <Typography className="text-muted" type="body-sm">
            {t('cefi:description.no.more.records')}
          </Typography>
        </View>
      );
    }

    return null;
  }, [allOrders.length, hasMore, ordersQuery.isFetching, page, t]);

  return (
    <View className="min-h-0 flex-1">
      <LegendList
        contentContainerStyle={{
          flexGrow: 1,
          paddingBottom: contentInsetBottom,
        }}
        data={listData}
        estimatedItemSize={ESTIMATED_ITEM_SIZE}
        getItemType={item => item.type}
        keyExtractor={item => item.key}
        ListEmptyComponent={listEmpty}
        ListFooterComponent={listFooter}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={LIST_END_REACHED_THRESHOLD}
        recycleItems
        refreshControl={<RefreshControl onRefresh={handleRefresh} refreshing={refreshing} />}
        renderItem={renderItem}
      />

      <OnrampOrderDetailSheet
        isOpen={isDetailOpen}
        orderId={detailOrderId}
        onOpenChange={open => {
          setIsDetailOpen(open);
          if (!open) {
            setDetailOrderId(null);
          }
        }}
      />
    </View>
  );
});

BuyActivity.displayName = 'BuyActivity';
