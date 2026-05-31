import { useCallback, useMemo } from 'react';

import { useTranslation } from 'react-i18next';
import { RefreshControl, View } from 'react-native';

import { AssetsPanel } from '@/components/home/assets-panel';
import { BalanceCard } from '@/components/home/balance-card';
import { HomeAuthActions } from '@/components/home/home-auth-actions';
import { HomeTopBar } from '@/components/home/home-top-bar';
import { QuickActions } from '@/components/home/quick-actions';
import { Page } from '@/components/page';
import { TabScreenScrollView } from '@/components/ui/tab-screen-scroll-view';
import { useQueryAssets } from '@/modules/defi/hooks/use-query-assets';

export default function HomeScreen() {
  const { t } = useTranslation(['defi']);
  const {
    balanceQuery,
    chain,
    currentAddress,
    isAssetsLoading,
    pricesQuery,
    rows,
    totalFiatValue,
    wallet,
  } = useQueryAssets();

  const assetStatusText = useMemo(() => {
    if (isAssetsLoading) {
      return t('description.home.loading.assets');
    }

    if (balanceQuery.error || pricesQuery.error) {
      return t('description.home.asset.unavailable');
    }

    if (!chain || !currentAddress) {
      return t('description.home.no.wallet');
    }

    return t('description.home.no.supported.assets');
  }, [balanceQuery.error, chain, currentAddress, isAssetsLoading, pricesQuery.error, t]);

  const isRefreshing = balanceQuery.isRefetching || pricesQuery.isRefetching;

  const onRefresh = useCallback(() => {
    void Promise.all([balanceQuery.refetch(), pricesQuery.refetch()]);
  }, [balanceQuery, pricesQuery]);

  return (
    <Page className="bg-background" tabBarInset>
      <TabScreenScrollView
        contentContainerClassName="gap-3 px-3 pt-2"
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />}
        tabBarAdditionalPadding={32}
      >
        <HomeAuthActions />

        <View className="gap-3">
          <HomeTopBar chain={chain} wallet={wallet} />

          <BalanceCard chain={chain} isLoading={isAssetsLoading} totalFiatValue={totalFiatValue} />

          <QuickActions />
        </View>

        <AssetsPanel
          chain={chain}
          isLoading={isAssetsLoading}
          rows={rows}
          statusText={assetStatusText}
        />
      </TabScreenScrollView>
    </Page>
  );
}
