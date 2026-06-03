import { Stack } from 'expo-router';

import { AutoLockEffect } from '@/components/lockscreen/auto-lock-effect';
import { LockScreenDialog } from '@/components/lockscreen/lockscreen-overlay';
import { LockScreenProvider } from '@/components/lockscreen/lockscreen-provider';
import { MigrationLoadingContent } from '@/components/migration/migration-loading-content';
import { Page } from '@/components/page';
import { EntryPhase } from '@/modules/app/enums/entry-phase.enum';
import { useAppMigration } from '@/modules/app/hooks/use-app-migration';
import { useEntryState } from '@/modules/app/hooks/use-entry-state';
import { useGlobalStore } from '@/modules/app/stores/global';
import { LiquidSessionInterceptor } from '@/modules/chain/hooks/use-liquid-session';

export default function AppLayout() {
  const request = useGlobalStore(store => store.lockRequest);
  const entryState = useEntryState();
  const migration = useAppMigration();

  if (!migration.isComplete) {
    return (
      <Page brand={{ display: ['brand', 'background'] }}>
        <MigrationLoadingContent migration={migration} />
      </Page>
    );
  }

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
          <Stack.Screen name="onramp-callback" options={{ headerShown: false }} />
        </Stack.Protected>
      </Stack>
      {request && entryState.phase !== EntryPhase.AppLock ? (
        <LockScreenDialog key={request.id} />
      ) : null}
      {entryState.phase === EntryPhase.Main ? <LiquidSessionInterceptor /> : null}
      <AutoLockEffect />
    </LockScreenProvider>
  );
}
