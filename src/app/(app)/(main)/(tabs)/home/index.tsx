import { useCallback, useMemo } from 'react';

import { useTranslation } from 'react-i18next';
import { RefreshControl, View } from 'react-native';

import { AssetsPanel } from '@/components/home/assets-panel';
import { BalanceCard } from '@/components/home/balance-card';
import { HomeAuthActions } from '@/components/home/home-auth-actions';
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
    <Page edges={['left', 'right']} tabBarInset>
      <TabScreenScrollView
        stackHeaderInset
        contentContainerClassName="gap-3 px-3"
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />}
        tabBarAdditionalPadding={24}
      >
        <HomeAuthActions />

        <View className="gap-3">
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
