import { useCallback } from 'react';

import { useQueryClient } from '@tanstack/react-query';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Tabs, cn } from 'heroui-native';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { ActivityTabPanel } from '@/components/activity/activity-tab-panel';
import { BuyActivity } from '@/components/activity/buy-activity';
import { TransactionActivity } from '@/components/activity/transaction-activity';
import { Page } from '@/components/page';
import { infiniteQueryOnrampOrdersOptions } from '@/modules/cefi/hooks/use-query-onramp-orders';

type ActivityTab = 'transaction' | 'withdraw' | 'swap' | 'buy';

interface ActivityTabLabelProps {
  children: string;
  isSelected: boolean;
}

const ActivityTabLabel = ({ children, isSelected }: ActivityTabLabelProps) => (
  <Tabs.Label className={cn('text-base', isSelected ? 'text-foreground' : 'text-muted')}>
    {children}
  </Tabs.Label>
);

const ActivityTabPlaceholder = () => <View className="bg-background min-h-0 flex-1" />;

export default function ActivityScreen() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { t } = useTranslation(['defi', 'cefi']);
  const params = useLocalSearchParams<{
    initialTab?: string;
    pendingOrderId?: string;
  }>();

  const activeTab = params.initialTab ?? 'transaction';

  const handleTabChange = useCallback(
    (value: ActivityTab) => {
      router.setParams({ initialTab: value });
    },
    [router],
  );

  const handlePendingOrderHandled = useCallback(() => {
    void queryClient.invalidateQueries(infiniteQueryOnrampOrdersOptions());
    router.setParams({ pendingOrderId: undefined });
  }, [queryClient, router]);

  return (
    <Page className="bg-background" edges={['left', 'right']} tabBarInset>
      <Tabs
        className="min-h-0 flex-1 gap-0"
        value={activeTab}
        variant="primary"
        onValueChange={value => handleTabChange(value as ActivityTab)}
      >
        <Tabs.List className="bg-surface">
          <Tabs.ScrollView contentContainerClassName="gap-5 px-4 py-3" scrollAlign="start">
            <Tabs.Trigger className="px-0" value="transaction">
              {({ isSelected }) => (
                <ActivityTabLabel isSelected={isSelected}>{t('tab.transaction')}</ActivityTabLabel>
              )}
            </Tabs.Trigger>
            <Tabs.Trigger className="px-0" value="withdraw">
              {({ isSelected }) => (
                <ActivityTabLabel isSelected={isSelected}>
                  {t('cefi:tab.withdraw')}
                </ActivityTabLabel>
              )}
            </Tabs.Trigger>
            <Tabs.Trigger className="px-0" value="swap">
              {({ isSelected }) => (
                <ActivityTabLabel isSelected={isSelected}>{t('tab.bridge')}</ActivityTabLabel>
              )}
            </Tabs.Trigger>
            <Tabs.Trigger className="px-0" value="buy">
              {({ isSelected }) => (
                <ActivityTabLabel isSelected={isSelected}>{t('tab.buy')}</ActivityTabLabel>
              )}
            </Tabs.Trigger>
          </Tabs.ScrollView>
        </Tabs.List>

        <View className="relative min-h-0 flex-1">
          <ActivityTabPanel activeTab={activeTab} tab="transaction">
            <TransactionActivity />
          </ActivityTabPanel>
          <ActivityTabPanel activeTab={activeTab} tab="withdraw">
            <ActivityTabPlaceholder />
          </ActivityTabPanel>
          <ActivityTabPanel activeTab={activeTab} tab="swap">
            <ActivityTabPlaceholder />
          </ActivityTabPanel>
          <ActivityTabPanel activeTab={activeTab} tab="buy">
            <BuyActivity
              pendingOrderId={params.pendingOrderId}
              onPendingOrderHandled={handlePendingOrderHandled}
            />
          </ActivityTabPanel>
        </View>
      </Tabs>
    </Page>
  );
}
