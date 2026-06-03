import { useRouter } from 'expo-router';
import { Button } from 'heroui-native';
import { useTranslation } from 'react-i18next';
import { Platform, View } from 'react-native';

import { Page } from '@/components/page';
import useHeaderHeight from '@/hooks/use-header-height';

export default function AddAccountScreen() {
  const { t } = useTranslation(['defi']);
  const router = useRouter();
  const headerHeight = useHeaderHeight();

  return (
    <Page.Stack className="px-8 pb-6">
      <View
        className="w-full flex-1 items-center justify-center gap-6"
        style={Platform.OS === 'ios' ? { paddingTop: headerHeight } : undefined}
      >
        <Button onPress={() => router.push('/account/add-info')} size="sm">
          <Button.Label>{t('defi:action.create.from.seed.phrase')}</Button.Label>
        </Button>

        <Button
          onPress={() => router.push('/account/import-private-key')}
          variant="outline"
          size="sm"
        >
          <Button.Label>{t('defi:action.import.private.key')}</Button.Label>
        </Button>
      </View>
    </Page.Stack>
  );
}
