import { useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { Button } from 'heroui-native';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator } from 'react-native';

import Brand from '@/components/brand';
import { ThemedText } from '@/components/ui/themed-text';
import { env } from '@/libs/env';
import { useGlobalStore } from '@/modules/app/stores/global';
import { generateRandomString } from '@/modules/keychain/crypto';
import { useMutationSetKeychainPassword } from '@/modules/keychain/hooks/use-mutation-set-keychain-password';
import { useQueryBiometryType } from '@/modules/keychain/hooks/use-query-biometry-type';
import { queryHasKeychainGenericPasswordOptions } from '@/modules/keychain/hooks/use-query-has-keychain-generic-password';
import { useUserStore } from '@/modules/user/stores/user';

export default function CheckBiometry() {
  const { t } = useTranslation(['global']);
  const queryClient = useQueryClient();

  const setStartup = useGlobalStore(state => state.setStartup);
  const setHasPassword = useUserStore(state => state.setHasPassword);
  const setUnlockMode = useUserStore(state => state.setUnlockMode);

  const { isLoading: isBiometryLoading, biometryLabel } = useQueryBiometryType();
  const setupBiometryMutation = useMutationSetKeychainPassword({
    onSuccess: () => {
      queryClient.setQueryData(
        queryHasKeychainGenericPasswordOptions(env.EXPO_PUBLIC_WALLET_DEFI_PASSWORD_SERVICE)
          .queryKey,
        true,
      );
      setHasPassword(true);
      setUnlockMode('biometry');
      setStartup(true);
      requestAnimationFrame(() => {
        router.replace('/onboarding');
      });
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
    <Brand
      display={['background']}
      wrapperProps={{ className: 'flex-1 items-center justify-center' }}
    >
      {setupBiometryMutation.isPending || isBiometryLoading ? (
        <ActivityIndicator />
      ) : (
        <Button onPress={handleSetupBiometry} variant="tertiary">
          <Button.Label>{t('action.verify.with.biometry', { biometryLabel })}</Button.Label>
        </Button>
      )}

      <ThemedText className="text-foreground mt-8 text-center text-lg">{biometryLabel}</ThemedText>

      {setupBiometryMutation.isError ? (
        <ThemedText className="text-danger mt-4 text-center text-sm">
          {t('error.keychain.verify.failed')}
        </ThemedText>
      ) : null}
    </Brand>
  );
}
