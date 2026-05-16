import { Stack } from 'expo-router';

import { AutoLockEffect } from '@/components/lockscreen/auto-lock-effect';
import { LockScreenOverlay } from '@/components/lockscreen/lockscreen-overlay';
import { LockScreenProvider } from '@/components/lockscreen/lockscreen-provider';
import { EntryPhase } from '@/modules/app/enums/entry-phase.enum';
import { useEntryState } from '@/modules/app/hooks/use-entry-state';
import { useGlobalStore } from '@/modules/app/stores/global';

export default function AppLayout() {
  const request = useGlobalStore(store => store.lockRequest);
  const entryState = useEntryState();

  return (
    <LockScreenProvider>
      <Stack>
        <Stack.Protected
          guard={
            entryState.phase === EntryPhase.SetPassword ||
            entryState.phase === EntryPhase.LegacyBiometryMigration ||
            entryState.phase === EntryPhase.AppLock
          }
        >
          <Stack.Screen name="app-lock" options={{ headerShown: false }} />
        </Stack.Protected>
        <Stack.Protected guard={entryState.phase === EntryPhase.Login}>
          <Stack.Screen name="login/index" options={{ headerShown: false }} />
          <Stack.Screen name="callback" options={{ headerShown: false }} />
        </Stack.Protected>
        <Stack.Protected guard={entryState.phase === EntryPhase.Onboarding}>
          <Stack.Screen name="onboarding" options={{ headerShown: false }} />
        </Stack.Protected>
        <Stack.Protected guard={entryState.phase === EntryPhase.Main}>
          <Stack.Screen name="(main)" options={{ headerShown: false }} />
        </Stack.Protected>
      </Stack>
      {request && entryState.phase !== EntryPhase.AppLock ? (
        <LockScreenOverlay key={request.id} />
      ) : null}
      <AutoLockEffect />
    </LockScreenProvider>
  );
}
