import { Stack } from 'expo-router';

export default function OnboardingLayout() {
  return (
    <Stack screenOptions={{ contentStyle: { backgroundColor: 'transparent' } }}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="create-wallet" options={{ headerShown: false }} />
      <Stack.Screen name="import-phrase" options={{ headerShown: false }} />
      <Stack.Screen name="backup-intro" options={{ headerShown: false }} />
      <Stack.Screen name="backup-phrase" options={{ headerShown: false }} />
      <Stack.Screen name="confirm-phrase" options={{ headerShown: false }} />
      <Stack.Screen name="done" options={{ headerShown: false }} />
    </Stack>
  );
}
