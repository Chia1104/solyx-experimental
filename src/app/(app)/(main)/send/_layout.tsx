import { Stack } from 'expo-router';

import { useStackScreenOptions } from '@/hooks/use-stack-screen-options';

export default function SendLayout() {
  const screenOptions = useStackScreenOptions();

  return (
    <Stack screenOptions={screenOptions}>
      <Stack.Screen name="index" />
      <Stack.Screen name="amount" />
      <Stack.Screen name="confirm" />
      <Stack.Screen name="[token]" />
    </Stack>
  );
}
