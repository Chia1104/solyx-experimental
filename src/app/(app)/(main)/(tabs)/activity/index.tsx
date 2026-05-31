import { useState } from 'react';

import { Tabs, cn } from 'heroui-native';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { ActivityTabPanel } from '@/components/activity/activity-tab-panel';
import { TransactionActivity } from '@/components/activity/transaction-activity';
import { Page } from '@/components/page';

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
  const { t } = useTranslation(['defi', 'cefi']);
  const [activeTab, setActiveTab] = useState<ActivityTab>('transaction');

  return (
    <Page className="bg-background" edges={['left', 'right']}>
      <Tabs
        className="min-h-0 flex-1"
        value={activeTab}
        variant="secondary"
        onValueChange={value => setActiveTab(value as ActivityTab)}
      >
        <Tabs.List className="bg-background border-separator shrink-0 border-b">
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
            <ActivityTabPlaceholder />
          </ActivityTabPanel>
        </View>
      </Tabs>
    </Page>
  );
}
