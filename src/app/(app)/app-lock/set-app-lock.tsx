import { router } from 'expo-router';
import { Button, Typography } from 'heroui-native';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { Page } from '@/components/page';
export default function SetAppLock() {
  const { t } = useTranslation(['global']);

  return (
    <Page.Brand className="justify-between px-10 py-24">
      <Typography className="text-foreground text-center text-3xl font-semibold">
        {t('title.set.app.lock')}
      </Typography>

      <View className="gap-4">
        <Typography className="text-foreground text-center text-lg" weight="medium">
          {t('description.set.app.lock.1')}
        </Typography>
        <Typography className="text-foreground text-center text-lg" weight="medium">
          {t('description.set.app.lock.2')}
        </Typography>
      </View>

      <View className="gap-6">
        <Button onPress={() => router.push('/app-lock/set-password')} size="sm">
          <Button.Label>{t('action.set.app.lock.password')}</Button.Label>
        </Button>
      </View>
    </Page.Brand>
  );
}
