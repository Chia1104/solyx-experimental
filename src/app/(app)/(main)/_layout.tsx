import { Stack } from 'expo-router';

import { useStackScreenOptions } from '@/hooks/use-stack-screen-options';

export default function DefiMainLayout() {
  const screenOptions = useStackScreenOptions();

  return (
    <Stack screenOptions={screenOptions}>
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
      <Stack.Screen name="account/manage" />
      <Stack.Screen name="account/add" />
      <Stack.Screen name="account/import-private-key" />
      <Stack.Screen name="account/export-private-key" />
      <Stack.Screen name="account/security" />
    </Stack>
  );
}
