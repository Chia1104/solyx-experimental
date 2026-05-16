import { router } from 'expo-router';
import { Button, Text } from 'heroui-native';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, View } from 'react-native';

import { Page } from '@/components/page';
import { useGlobalStore } from '@/modules/app/stores/global';
import { useMutationSetKeychainBiometryPassword } from '@/modules/keychain/hooks/use-mutation-set-keychain-biometry-password';
import { useQueryBiometryType } from '@/modules/keychain/hooks/use-query-biometry-type';
import { useUserStore } from '@/modules/user/stores/user';

export default function CheckBiometry() {
  const { t } = useTranslation(['global']);

  const requestLock = useGlobalStore(state => state.requestLock);
  const setUnlockMode = useUserStore(state => state.setUnlockMode);

  const { isLoading: isBiometryLoading, biometryLabel } = useQueryBiometryType();
  const setupBiometryMutation = useMutationSetKeychainBiometryPassword({
    onSuccess: () => {
      setUnlockMode('biometry');
      router.replace('/app-lock/auto-lock');
    },
  });

  const handleSetupBiometry = async () => {
    const password = await requestLock({
      isDismissible: false,
      reason: t('description.verify.app.lock'),
      type: 'password',
    });

    setupBiometryMutation.mutate({
      value: password,
    });
  };

  const handleSkip = () => {
    setUnlockMode('password');
    router.replace('/app-lock/auto-lock');
  };

  return (
    <Page
      isBrandVisible
      className="items-center justify-center px-10"
      header={{
        onBack: () => router.back(),
      }}
    >
      {setupBiometryMutation.isPending || isBiometryLoading ? (
        <ActivityIndicator />
      ) : (
        <View className="w-full gap-6">
          {biometryLabel ? (
            <Button onPress={handleSetupBiometry} variant="tertiary">
              <Button.Label>{t('action.verify.with.biometry', { biometryLabel })}</Button.Label>
            </Button>
          ) : null}

          <Button onPress={handleSkip} variant={biometryLabel ? 'outline' : 'primary'}>
            <Button.Label>{t('action.skip')}</Button.Label>
          </Button>
        </View>
      )}

      <Text className="text-foreground mt-8 text-center text-lg" weight="medium">
        {biometryLabel}
      </Text>

      {setupBiometryMutation.isError ? (
        <Text className="text-danger mt-4 text-center text-sm">
          {t('error.keychain.verify.failed')}
        </Text>
      ) : null}
    </Page>
  );
}
