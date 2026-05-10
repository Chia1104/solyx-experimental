import { Stack } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';

import { AutoLockEffect } from '@/components/lockscreen/auto-lock-effect';
import { LockScreenOverlay } from '@/components/lockscreen/lockscreen-overlay';
import { LockScreenProvider } from '@/components/lockscreen/lockscreen-provider';
import { CompactHeader } from '@/components/ui/compact-header';
import { EntryPhase } from '@/modules/app/enums/entry-phase.enum';
import { useEntryState } from '@/modules/app/hooks/use-entry-state';
import { useGlobalStore } from '@/modules/app/stores/global';

const LockScreen = () => {
  const request = useGlobalStore(store => store.lockRequest);
  if (!request) return null;

  return <LockScreenOverlay key={request.id} />;
};

const Stacks = () => {
  const request = useGlobalStore(store => store.lockRequest);
  const entryState = useEntryState();

  return (
    <>
      {entryState.isLoading ? (
        <View className="bg-background flex-1 items-center justify-center">
          <ActivityIndicator />
        </View>
      ) : (
        <Stack>
          <Stack.Protected guard={entryState.phase === EntryPhase.SetPassword}>
            <Stack.Screen name="app-lock/set-app-lock" options={{ headerShown: false }} />
            <Stack.Screen name="app-lock/set-password" options={{ header: CompactHeader }} />
            <Stack.Screen name="app-lock/check-biometry" options={{ headerShown: false }} />
          </Stack.Protected>
          <Stack.Protected guard={entryState.phase === EntryPhase.Onboarding}>
            <Stack.Screen name="onboarding/index" options={{ headerShown: false }} />
          </Stack.Protected>
          <Stack.Protected guard={entryState.phase === EntryPhase.AppLock}>
            <Stack.Screen name="app-lock/index" options={{ headerShown: false }} />
          </Stack.Protected>
          <Stack.Protected guard={entryState.phase === EntryPhase.Main}>
            <Stack.Screen name="(main)" options={{ headerShown: false }} />
          </Stack.Protected>
        </Stack>
      )}
      {request && entryState.phase !== EntryPhase.AppLock ? <LockScreen key={request.id} /> : null}
      <AutoLockEffect />
    </>
  );
};

export default function AppLayout() {
  return (
    <LockScreenProvider>
      <Stacks />
    </LockScreenProvider>
  );
}
