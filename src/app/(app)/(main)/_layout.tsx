import { Stack } from 'expo-router';

import { ChainTransitionProvider } from '@/components/chain-transition';
import { useStackScreenOptions } from '@/hooks/use-stack-screen-options';

export default function DefiMainLayout() {
  const screenOptions = useStackScreenOptions();

  return (
    <ChainTransitionProvider>
      <Stack screenOptions={screenOptions}>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="assets/[symbol]" options={{ presentation: 'modal' }} />
        <Stack.Screen name="send" options={{ presentation: 'modal', headerShown: false }} />
        <Stack.Screen name="receive/index" options={{ presentation: 'modal' }} />
        <Stack.Screen name="scanner/index" options={{ presentation: 'modal' }} />
        <Stack.Screen name="buy" options={{ presentation: 'modal', headerShown: false }} />
        <Stack.Screen name="bridge/confirm" />
        <Stack.Screen name="bridge/orders" />
        <Stack.Screen name="withdraw/index" />
        <Stack.Screen name="withdraw/detail" />
        <Stack.Screen name="withdraw/resubmit" />
        <Stack.Screen name="kyc/gate" options={{ presentation: 'modal' }} />
        <Stack.Screen name="kyc/overview" />
        <Stack.Screen name="kyc/verification" />
        <Stack.Screen name="settings/account" />
        <Stack.Screen name="settings/email" />
        <Stack.Screen name="settings/language" />
        <Stack.Screen name="settings/contact-us" />
        <Stack.Screen name="account" options={{ headerShown: false, presentation: 'modal' }} />
      </Stack>
    </ChainTransitionProvider>
  );
}
