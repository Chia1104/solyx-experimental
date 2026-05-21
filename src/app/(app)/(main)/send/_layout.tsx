import { Stack } from 'expo-router';

export default function SendLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="amount" options={{ headerShown: false }} />
      <Stack.Screen name="confirm" options={{ headerShown: false }} />
      <Stack.Screen name="[token]" options={{ headerShown: false }} />
    </Stack>
  );
}
