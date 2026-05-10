import { Stack } from 'expo-router';

import { CompactHeader } from '@/components/ui/compact-header';
import { EntryPhase } from '@/modules/app/enums/entry-phase.enum';
import { useEntryState } from '@/modules/app/hooks/use-entry-state';

export default function AppLockLayout() {
  const entryState = useEntryState();
  const initialRouteName = entryState.phase === EntryPhase.SetPassword ? 'set-app-lock' : 'index';

  return (
    <Stack initialRouteName={initialRouteName}>
      <Stack.Protected guard={entryState.phase === EntryPhase.SetPassword}>
        <Stack.Screen name="set-app-lock" options={{ headerShown: false }} />
        <Stack.Screen name="set-password" options={{ header: CompactHeader }} />
        <Stack.Screen name="check-biometry" options={{ header: CompactHeader }} />
        <Stack.Screen name="auto-lock" options={{ headerShown: false }} />
      </Stack.Protected>
      <Stack.Protected guard={entryState.phase === EntryPhase.AppLock}>
        <Stack.Screen name="index" options={{ headerShown: false }} />
      </Stack.Protected>
    </Stack>
  );
}
