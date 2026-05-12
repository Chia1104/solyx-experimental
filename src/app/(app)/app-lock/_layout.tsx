import { Stack } from 'expo-router';

import { EntryPhase } from '@/modules/app/enums/entry-phase.enum';
import { useEntryState } from '@/modules/app/hooks/use-entry-state';

export default function AppLockLayout() {
  const entryState = useEntryState();
  const initialRouteName = entryState.phase === EntryPhase.SetPassword ? 'set-app-lock' : 'index';

  return (
    <Stack
      initialRouteName={initialRouteName}
      screenOptions={{ contentStyle: { backgroundColor: 'transparent' } }}
    >
      <Stack.Protected guard={entryState.phase === EntryPhase.SetPassword}>
        <Stack.Screen name="set-app-lock" options={{ headerShown: false }} />
        <Stack.Screen name="set-password" options={{ headerShown: false }} />
        <Stack.Screen name="check-biometry" options={{ headerShown: false }} />
        <Stack.Screen name="auto-lock" options={{ headerShown: false }} />
      </Stack.Protected>
      <Stack.Protected guard={entryState.phase === EntryPhase.AppLock}>
        <Stack.Screen name="index" options={{ headerShown: false }} />
      </Stack.Protected>
    </Stack>
  );
}
