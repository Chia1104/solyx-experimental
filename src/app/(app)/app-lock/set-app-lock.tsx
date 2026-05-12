import { router } from 'expo-router';
import { Button, Text } from 'heroui-native';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { Page } from '@/components/page';
import { useQueryBiometryType } from '@/modules/keychain/hooks/use-query-biometry-type';

export default function SetAppLock() {
  const { t } = useTranslation(['global']);
  const { isLoading, biometryLabel } = useQueryBiometryType();

  return (
    <Page isBrandVisible className="justify-between px-10 py-24">
      <Text className="text-foreground text-center text-3xl font-semibold">
        {t('title.set.app.lock')}
      </Text>

      <View className="gap-4">
        <Text className="text-foreground text-center text-lg" weight="medium">
          {t('description.set.app.lock.1')}
        </Text>
        <Text className="text-foreground text-center text-lg" weight="medium">
          {t('description.set.app.lock.2')}
        </Text>
      </View>

      <View className="gap-6">
        {biometryLabel ? (
          <Button onPress={() => router.push('/app-lock/check-biometry')} isDisabled={isLoading}>
            <Button.Label>
              {t('action.set.app.lock.biometry', {
                biometryLabel,
              })}
            </Button.Label>
          </Button>
        ) : null}

        <Button
          onPress={() => router.push('/app-lock/set-password')}
          variant={biometryLabel ? 'outline' : 'primary'}
        >
          <Button.Label>{t('action.set.app.lock.password')}</Button.Label>
        </Button>
      </View>
    </Page>
  );
}
