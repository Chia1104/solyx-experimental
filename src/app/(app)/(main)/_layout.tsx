import { Stack } from 'expo-router';

export default function DefiMainLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="assets/[symbol]" options={{ presentation: 'modal' }} />
      <Stack.Screen name="send" options={{ presentation: 'modal' }} />
      <Stack.Screen name="receive/index" options={{ presentation: 'modal' }} />
      <Stack.Screen name="scanner/index" options={{ presentation: 'modal' }} />
      <Stack.Screen name="buy/index" options={{ presentation: 'modal' }} />
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
