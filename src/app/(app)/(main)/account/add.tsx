import { useRouter } from 'expo-router';
import { Button } from 'heroui-native';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { Page } from '@/components/page';

export default function AddAccountScreen() {
  const { t } = useTranslation(['defi']);
  const router = useRouter();

  return (
    <Page className="items-center justify-between px-8 py-12">
      <View className="w-full flex-1 items-center justify-center gap-6">
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
    </Page>
  );
}
