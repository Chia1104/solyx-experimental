import { Stack } from 'expo-router';

import { useStackScreenOptions } from '@/hooks/use-stack-screen-options';

export default function OnboardingLayout() {
  const screenOptions = useStackScreenOptions();

  return (
    <Stack screenOptions={screenOptions}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="create-wallet" options={{ headerShown: false }} />
      <Stack.Screen name="import-phrase" />
      <Stack.Screen name="backup-intro" options={{ headerShown: false }} />
      <Stack.Screen name="backup-phrase" options={{ headerShown: false }} />
      <Stack.Screen name="confirm-phrase" options={{ headerShown: false }} />
      <Stack.Screen name="done" options={{ headerShown: false }} />
    </Stack>
  );
}
