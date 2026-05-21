import { useCallback, useMemo, useState } from 'react';

import { useTranslation } from 'react-i18next';
import { ScrollView, RefreshControl, View } from 'react-native';

import { Page } from '@/components/page';
import {
  AssetsPanel,
  BalanceCard,
  HomeAuthActions,
  HomeTopBar,
  QuickActions,
} from '@/modules/defi/components/home/home-sections';
import { useQueryAssets } from '@/modules/defi/hooks/use-query-assets';

export default function HomeScreen() {
  const { t } = useTranslation(['defi']);
  const [isBalanceVisible, setIsBalanceVisible] = useState(false);
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
    <Page className="bg-background">
      <ScrollView
        contentContainerClassName="gap-3 px-3 pt-2 pb-8"
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />}
      >
        <HomeAuthActions />

        <View className="gap-3">
          <HomeTopBar chain={chain} wallet={wallet} />

          <BalanceCard
            chain={chain}
            isBalanceVisible={isBalanceVisible}
            isLoading={isAssetsLoading}
            totalFiatValue={totalFiatValue}
            onToggleVisibility={() => setIsBalanceVisible(value => !value)}
          />

          <QuickActions />
        </View>

        <AssetsPanel
          chain={chain}
          isBalanceVisible={isBalanceVisible}
          isLoading={isAssetsLoading}
          rows={rows}
          statusText={assetStatusText}
        />
      </ScrollView>
    </Page>
  );
}
