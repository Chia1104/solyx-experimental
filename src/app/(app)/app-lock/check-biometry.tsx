import { useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { Button, Text } from 'heroui-native';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator } from 'react-native';

import { Page } from '@/components/page';
import { env } from '@/libs/env';
import { generateRandomString } from '@/modules/keychain/crypto';
import { useMutationSetKeychainPassword } from '@/modules/keychain/hooks/use-mutation-set-keychain-password';
import { useQueryBiometryType } from '@/modules/keychain/hooks/use-query-biometry-type';
import { queryHasKeychainGenericPasswordOptions } from '@/modules/keychain/hooks/use-query-has-keychain-generic-password';
import { useUserStore } from '@/modules/user/stores/user';

export default function CheckBiometry() {
  const { t } = useTranslation(['global']);
  const queryClient = useQueryClient();

  const setUnlockMode = useUserStore(state => state.setUnlockMode);

  const { isLoading: isBiometryLoading, biometryLabel } = useQueryBiometryType();
  const setupBiometryMutation = useMutationSetKeychainPassword({
    onSuccess: () => {
      queryClient.setQueryData(
        queryHasKeychainGenericPasswordOptions(env.EXPO_PUBLIC_WALLET_DEFI_PASSWORD_SERVICE)
          .queryKey,
        true,
      );
      setUnlockMode('biometry');
      router.replace('/app-lock/auto-lock');
    },
  });

  const handleSetupBiometry = () => {
    const password = generateRandomString();
    setupBiometryMutation.mutate({
      useBiometry: true,
      value: password,
    });
  };

  return (
    <Page
      isBrandVisible
      className="items-center justify-center"
      header={{
        onBack: () => router.back(),
      }}
    >
      {setupBiometryMutation.isPending || isBiometryLoading ? (
        <ActivityIndicator />
      ) : (
        <Button onPress={handleSetupBiometry} variant="tertiary">
          <Button.Label>{t('action.verify.with.biometry', { biometryLabel })}</Button.Label>
        </Button>
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
