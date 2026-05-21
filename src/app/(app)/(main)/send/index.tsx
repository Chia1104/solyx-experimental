import { useMemo } from 'react';

import BigNumber from 'bignumber.js';
import { useRouter } from 'expo-router';
import { Text } from 'heroui-native';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { AssetList, AssetListSkeleton } from '@/components/home/asset-list';
import { Page } from '@/components/page';
import { KeyboardAwareScrollView } from '@/components/ui/keyboard-aware-scroll-view';
import { useQueryAssets } from '@/modules/defi/hooks/use-query-assets';

export default function SendTokenScreen() {
  const router = useRouter();
  const { t } = useTranslation(['defi']);
  const { isAssetsLoading, rows } = useQueryAssets();

  const selectableRows = useMemo(() => {
    return rows.filter(row => new BigNumber(row.balance).isGreaterThan(0));
  }, [rows]);

  return (
    <Page className="bg-background" header={{ onBack: router.back, title: t('title.selectToken') }}>
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
          <View className="flex-1 items-center justify-center px-6">
            <Text className="text-foreground/60 text-center">
              {t('description.selectToken.not.assets')}
            </Text>
          </View>
        )}
      </KeyboardAwareScrollView>
    </Page>
  );
}
