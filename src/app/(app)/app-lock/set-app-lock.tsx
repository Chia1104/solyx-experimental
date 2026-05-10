import { router } from 'expo-router';
import { Button } from 'heroui-native';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, View } from 'react-native';
import { BIOMETRY_TYPE } from 'react-native-keychain';

import { ThemedText } from '@/components/ui/themed-text';
import { useQueryBiometryType } from '@/modules/keychain/hooks/use-query-biometry-type';

const getBiometryLabelKey = (type?: BIOMETRY_TYPE | null) => {
  switch (type) {
    case BIOMETRY_TYPE.FACE_ID:
      return 'label.biometry.face.id' as const;
    case BIOMETRY_TYPE.TOUCH_ID:
      return 'label.biometry.touch.id' as const;
    case BIOMETRY_TYPE.FACE:
      return 'label.biometry.face.unlock' as const;
    case BIOMETRY_TYPE.FINGERPRINT:
      return 'label.biometry.fingerprint.unlock' as const;
    default:
      return null;
  }
};

export default function SetAppLock() {
  const { t } = useTranslation(['global']);
  const { data: biometryType, isLoading } = useQueryBiometryType();
  const biometryLabelKey = getBiometryLabelKey(biometryType);
  const biometryLabel = biometryLabelKey ? t(biometryLabelKey) : undefined;

  return (
    <View className="bg-background flex-1 justify-between px-10 py-24">
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
        {isLoading ? (
          <ActivityIndicator />
        ) : biometryLabel ? (
          <Button onPress={() => router.push('/app-lock/check-biometry')}>
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
    </View>
  );
}
