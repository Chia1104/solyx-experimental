import { useCallback, useEffect, useMemo, useState } from 'react';

import { useLocalSearchParams, useRouter } from 'expo-router';
import { Tabs, cn } from 'heroui-native';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { ActivityTabPanel } from '@/components/activity/activity-tab-panel';
import { BuyActivity } from '@/components/activity/buy-activity';
import { TransactionActivity } from '@/components/activity/transaction-activity';
import { Page } from '@/components/page';

type ActivityTab = 'transaction' | 'withdraw' | 'swap' | 'buy';

const isActivityTab = (value: string | undefined): value is ActivityTab =>
  value === 'transaction' || value === 'withdraw' || value === 'swap' || value === 'buy';

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

const getSingleParam = (value: string | string[] | undefined) => {
  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
};

export default function ActivityScreen() {
  const router = useRouter();
  const { t } = useTranslation(['defi', 'cefi']);
  const params = useLocalSearchParams<{
    initialTab?: string;
    pendingOrderId?: string;
  }>();

  const initialTabParam = getSingleParam(params.initialTab);
  const pendingOrderIdParam = getSingleParam(params.pendingOrderId);

  const [activeTab, setActiveTab] = useState<ActivityTab>(() =>
    isActivityTab(initialTabParam) ? initialTabParam : 'transaction',
  );
  const [pendingOrderId, setPendingOrderId] = useState<string | undefined>(pendingOrderIdParam);

  useEffect(() => {
    if (isActivityTab(initialTabParam)) {
      setActiveTab(initialTabParam);
    }
  }, [initialTabParam]);

  useEffect(() => {
    if (pendingOrderIdParam) {
      setPendingOrderId(pendingOrderIdParam);
    }
  }, [pendingOrderIdParam]);

  const handlePendingOrderHandled = useCallback(() => {
    setPendingOrderId(undefined);
    router.setParams({ pendingOrderId: undefined });
  }, [router]);

  const buyActivity = useMemo(
    () => (
      <BuyActivity
        pendingOrderId={pendingOrderId}
        onPendingOrderHandled={handlePendingOrderHandled}
      />
    ),
    [handlePendingOrderHandled, pendingOrderId],
  );

  return (
    <Page className="bg-background" edges={['left', 'right']} tabBarInset>
      <Tabs
        className="min-h-0 flex-1 gap-0"
        value={activeTab}
        variant="secondary"
        onValueChange={value => setActiveTab(value as ActivityTab)}
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
            {buyActivity}
          </ActivityTabPanel>
        </View>
      </Tabs>
    </Page>
  );
}
