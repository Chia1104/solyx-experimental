import { router } from 'expo-router';
import { Button } from 'heroui-native';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import Brand from '@/components/brand';
import { ThemedText } from '@/components/ui/themed-text';
import { useQueryBiometryType } from '@/modules/keychain/hooks/use-query-biometry-type';

export default function SetAppLock() {
  const { t } = useTranslation(['global']);
  const { isLoading, biometryLabel } = useQueryBiometryType();

  return (
    <Brand
      display={['background']}
      wrapperProps={{ className: 'flex-1 justify-between px-10 py-24' }}
    >
      <ThemedText className="text-foreground text-center text-3xl font-semibold">
        {t('title.set.app.lock')}
      </ThemedText>

      <View className="gap-4">
        <ThemedText className="text-foreground text-center text-lg">
          {t('description.set.app.lock.1')}
        </ThemedText>
        <ThemedText className="text-foreground text-center text-lg">
          {t('description.set.app.lock.2')}
        </ThemedText>
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
    </Brand>
  );
}
