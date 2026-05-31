import { useMemo } from 'react';

import BigNumber from 'bignumber.js';
import { useRouter } from 'expo-router';
import { EmptyState } from 'heroui-native-pro/empty-state';
import { useTranslation } from 'react-i18next';

import { AssetList, AssetListSkeleton } from '@/components/home/asset-list';
import { Page } from '@/components/page';
import { KeyboardAwareScrollView } from '@/components/ui/keyboard-aware-scroll-view';
import { ThemedIcon } from '@/components/ui/themed-icon';
import { useQueryAssets } from '@/modules/defi/hooks/use-query-assets';

export default function SendTokenScreen() {
  const router = useRouter();
  const { t } = useTranslation(['defi']);
  const { isAssetsLoading, rows } = useQueryAssets();

  const selectableRows = useMemo(() => {
    return rows.filter(row => new BigNumber(row.balance).isGreaterThan(0));
  }, [rows]);

  return (
    <Page className="bg-background">
      <KeyboardAwareScrollView contentContainerStyle={{ padding: 24 }}>
        {isAssetsLoading ? (
          <AssetListSkeleton />
        ) : selectableRows.length > 0 ? (
          <AssetList
            onPressAsset={row => {
              router.push({
                pathname: '/send/[token]',
                params: {
                  token: row.address,
                },
              });
            }}
            rows={selectableRows}
          />
        ) : (
          <EmptyState className="min-h-[320px] flex-1 justify-center">
            <EmptyState.Header>
              <EmptyState.Media variant="icon">
                <ThemedIcon className="text-muted" name="wallet-outline" size={20} />
              </EmptyState.Media>
              <EmptyState.Title>{t('description.selectToken.not.assets')}</EmptyState.Title>
            </EmptyState.Header>
          </EmptyState>
        )}
      </KeyboardAwareScrollView>
    </Page>
  );
}
