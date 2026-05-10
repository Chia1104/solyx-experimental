import { useEffect, useRef } from 'react';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { Button } from 'heroui-native';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, View } from 'react-native';
import { BIOMETRY_TYPE } from 'react-native-keychain';
import Crypto from 'react-native-quick-crypto';

import { ThemedText } from '@/components/ui/themed-text';
import { env } from '@/libs/env';
import { useGlobalStore } from '@/modules/app/stores/global';
import { useQueryBiometryType } from '@/modules/keychain/hooks/use-query-biometry-type';
import {
  getGenericPassword,
  getPrivateAccessControlOptions,
  setGenericPassword,
} from '@/modules/keychain/utils';
import { useUserStore } from '@/modules/user/stores/user';

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

const generatePassword = () => `${Crypto.randomUUID()}${Crypto.randomUUID()}`;

export default function CheckBiometry() {
  const { t } = useTranslation(['global']);
  const queryClient = useQueryClient();
  const hasInitialized = useRef(false);

  const setStartup = useGlobalStore(state => state.setStartup);
  const setHasPassword = useUserStore(state => state.setHasPassword);
  const setLoggedState = useUserStore(state => state.setLoggedState);
  const setUnlockMode = useUserStore(state => state.setUnlockMode);

  const { data: biometryType, isLoading: isBiometryLoading } = useQueryBiometryType();
  const biometryLabelKey = getBiometryLabelKey(biometryType);
  const biometryLabel = biometryLabelKey ? t(biometryLabelKey) : 'Biometry';

  const completeSetup = () => {
    queryClient.setQueryData(
      ['keychain', 'has-generic-password', env.EXPO_PUBLIC_WALLET_DEFI_PASSWORD_SERVICE],
      true,
    );
    setHasPassword(true);
    setUnlockMode('biometry');
    setStartup(true);
    setLoggedState(true);
    router.replace('/');
  };

  const setupBiometryMutation = useMutation({
    mutationFn: async () => {
      if (!biometryType) {
        throw new Error('Biometry is not available');
      }

      const password = generatePassword();
      const options = await getPrivateAccessControlOptions();

      await setGenericPassword({
        options,
        password,
        service: env.EXPO_PUBLIC_WALLET_DEFI_PASSWORD_SERVICE,
      });

      const verifiedPassword = await getGenericPassword({
        service: env.EXPO_PUBLIC_WALLET_DEFI_PASSWORD_SERVICE,
      });

      if (!verifiedPassword) {
        throw new Error('Unable to verify biometry credential');
      }

      return verifiedPassword;
    },
    onSuccess: completeSetup,
  });

  useEffect(() => {
    if (isBiometryLoading || hasInitialized.current) return;

    if (!biometryType) {
      router.replace('/app-lock/set-password');
      return;
    }

    hasInitialized.current = true;
    setupBiometryMutation.mutate();
  }, [biometryType, isBiometryLoading, setupBiometryMutation]);

  return (
    <View className="bg-background flex-1 px-6 py-12">
      <View className="items-start">
        <Button onPress={() => router.back()} size="sm" variant="ghost">
          <Button.Label>{t('action.back')}</Button.Label>
        </Button>
      </View>

      <View className="flex-1 items-center justify-center">
        {setupBiometryMutation.isPending || isBiometryLoading ? (
          <ActivityIndicator />
        ) : (
          <Button onPress={() => setupBiometryMutation.mutate()} variant="tertiary">
            <Button.Label>{t('action.verify.with.biometry', { biometryLabel })}</Button.Label>
          </Button>
        )}

        <ThemedText className="text-foreground mt-8 text-center text-lg">
          {biometryLabel}
        </ThemedText>

        {setupBiometryMutation.isError ? (
          <ThemedText className="text-danger mt-4 text-center text-sm">
            {t('error.keychain.verify.failed')}
          </ThemedText>
        ) : null}
      </View>
    </View>
  );
}
