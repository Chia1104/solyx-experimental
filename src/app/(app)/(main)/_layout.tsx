import { Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { ChainTransitionProvider } from '@/components/chain-transition';
import { BackButton } from '@/components/ui/back-button';
import {
  iosTransparentHeaderOptions,
  useStackScreenOptions,
} from '@/hooks/use-stack-screen-options';

export default function DefiMainLayout() {
  const screenOptions = useStackScreenOptions();
  const { t } = useTranslation(['defi', 'global']);

  return (
    <ChainTransitionProvider>
      <Stack screenOptions={screenOptions}>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="assets/[symbol]"
          options={{
            presentation: 'modal',
            ...iosTransparentHeaderOptions,
          }}
        />
        <Stack.Screen name="send" options={{ presentation: 'modal', headerShown: false }} />
        <Stack.Screen
          name="scanner/index"
          options={{
            presentation: 'fullScreenModal',
            title: t('title.scan.QR.Code'),
            headerStyle: {
              backgroundColor: 'transparent',
            },
            headerBlurEffect: undefined,
            headerTransparent: true,
            headerTitleStyle: {
              color: '#fff',
            },
            headerLeft: () => (
              <BackButton
                classnames={{
                  icon: 'text-white',
                }}
              />
            ),
            headerBackVisible: false,
          }}
        />
        <Stack.Screen name="buy" options={{ presentation: 'modal', headerShown: false }} />
        <Stack.Screen
          name="withdraw/index"
          options={{
            title: t('title.withdraw'),
            ...iosTransparentHeaderOptions,
          }}
        />
        <Stack.Screen
          name="withdraw/detail"
          options={{
            title: t('title.withdraw.detail'),
            ...iosTransparentHeaderOptions,
          }}
        />
        <Stack.Screen
          name="withdraw/resubmit"
          options={{
            title: t('title.withdraw.resubmit'),
            ...iosTransparentHeaderOptions,
          }}
        />
        <Stack.Screen
          name="kyc/gate"
          options={{
            presentation: 'modal',
            title: t('title.kyc.gate'),
            ...iosTransparentHeaderOptions,
          }}
        />
        <Stack.Screen
          name="kyc/overview"
          options={{
            title: t('title.kyc.overview'),
            ...iosTransparentHeaderOptions,
          }}
        />
        <Stack.Screen
          name="kyc/verification"
          options={{
            title: t('title.kyc.verification'),
            ...iosTransparentHeaderOptions,
          }}
        />
        <Stack.Screen name="account" options={{ headerShown: false, presentation: 'modal' }} />
      </Stack>
    </ChainTransitionProvider>
  );
}
