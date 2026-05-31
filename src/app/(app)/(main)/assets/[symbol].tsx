import { useCallback, useMemo } from 'react';

import { Stack, useLocalSearchParams } from 'expo-router';
import { Typography } from 'heroui-native';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { TransactionActivity } from '@/components/activity/transaction-activity';
import { AssetActionButtons } from '@/components/assets/asset-action-buttons';
import { AssetBalanceSection } from '@/components/assets/asset-balance-section';
import { Page } from '@/components/page';
import useHeaderHeight from '@/hooks/use-header-height';
import { useQueryMeta } from '@/modules/cefi/hooks/use-query-meta';
import {
  isCoinbaseOnrampEnabled,
  isDefiWithdrawalEnabled,
} from '@/modules/cefi/utils/app-features';
import { useDefiAccount } from '@/modules/defi/hooks/use-defi-account';
import { useDefiRecordSync } from '@/modules/defi/hooks/use-defi-record-sync';
import { useQueryAssets } from '@/modules/defi/hooks/use-query-assets';
import {
  getAssetActionFlags,
  getIsNativeToken,
} from '@/modules/defi/utils/asset-action-flags.utils';

export default function AssetDetailScreen() {
  const { symbol } = useLocalSearchParams<{ symbol: string }>();
  const { t } = useTranslation(['defi']);
  const headerHeight = useHeaderHeight();
  const insets = useSafeAreaInsets();
  const { data: meta } = useQueryMeta();
  const { assets, balanceQuery, isAssetsLoading, pricesQuery, rows } = useQueryAssets();
  const { chain, currentChainId, isEVM, isLIQUID, isTRON } = useDefiAccount();
  const { isSyncingRecords, syncRecords } = useDefiRecordSync();

  const resolvedSymbol = symbol?.toUpperCase() ?? '';

  const resolvedCurrency = useMemo(() => {
    if (!resolvedSymbol) {
      return null;
    }

    return assets.find(currency => currency.symbol.toUpperCase() === resolvedSymbol) ?? null;
  }, [assets, resolvedSymbol]);

  const assetRow = useMemo(() => {
    if (!resolvedSymbol) {
      return null;
    }

    return rows.find(row => row.symbol.toUpperCase() === resolvedSymbol) ?? null;
  }, [resolvedSymbol, rows]);

  const isNativeToken = useMemo(
    () =>
      getIsNativeToken({
        chain,
        currency: resolvedCurrency,
        isLIQUID,
      }),
    [chain, isLIQUID, resolvedCurrency],
  );

  const actionFlags = useMemo(
    () =>
      getAssetActionFlags({
        coinbaseOnrampEnabled: isCoinbaseOnrampEnabled(meta, currentChainId),
        currencySymbol: resolvedCurrency?.symbol,
        defiWithdrawalEnabled: isDefiWithdrawalEnabled(meta),
        isEVM,
        isLIQUID,
        isNativeToken,
        isTRON,
      }),
    [currentChainId, isEVM, isLIQUID, isNativeToken, isTRON, meta, resolvedCurrency?.symbol],
  );

  const isRefreshing = balanceQuery.isRefetching || pricesQuery.isRefetching || isSyncingRecords;

  const onRefresh = useCallback(() => {
    void Promise.all([balanceQuery.refetch(), pricesQuery.refetch(), syncRecords('latest')]);
  }, [balanceQuery, pricesQuery, syncRecords]);

  const headerComponent = useMemo(
    () => (
      <>
        <View className="items-center">
          <AssetBalanceSection
            balance={assetRow?.balance ?? '0'}
            fiatValue={assetRow?.fiatValue.toNumber() ?? 0}
            isLoading={isAssetsLoading}
            symbol={resolvedCurrency?.symbol ?? resolvedSymbol}
          />

          {resolvedCurrency ? (
            <AssetActionButtons
              actionFlags={actionFlags}
              isLIQUID={isLIQUID}
              isNativeToken={isNativeToken}
              tokenAddress={resolvedCurrency.address}
              tokenSymbol={resolvedCurrency.symbol}
            />
          ) : (
            <View className="w-full px-6 pb-8">
              <View className="bg-content1 rounded-3xl p-5">
                <Typography className="text-default-soft-hover text-center">
                  {t('description.home.no.supported.assets')}
                </Typography>
              </View>
            </View>
          )}
        </View>

        <View className="bg-separator h-px" />
      </>
    ),
    [
      actionFlags,
      assetRow?.balance,
      assetRow?.fiatValue,
      isAssetsLoading,
      isLIQUID,
      isNativeToken,
      resolvedCurrency,
      resolvedSymbol,
      t,
    ],
  );

  return (
    <Page className="bg-background" edges={['left', 'right']}>
      <Stack.Screen options={{ title: resolvedCurrency?.symbol ?? resolvedSymbol }} />

      <View className="min-h-0 flex-1">
        {resolvedSymbol ? (
          <TransactionActivity
            contentInsetBottom={insets.bottom + 16}
            contentInsetTop={headerHeight}
            currencySymbol={resolvedSymbol}
            emptyText={t('description.no.activity')}
            headerComponent={headerComponent}
            onRefresh={onRefresh}
            refreshing={isRefreshing}
            showRecordsLimitFooter={false}
            showTransactionNotice={false}
          />
        ) : null}
      </View>
    </Page>
  );
}
