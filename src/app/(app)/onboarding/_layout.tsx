import { Stack } from 'expo-router';

import { useStackScreenOptions } from '@/hooks/use-stack-screen-options';
import { useOnboardingSessionStore } from '@/modules/onboarding/stores/onboarding-session';
import { useUserStore } from '@/modules/user/stores/user';

export default function OnboardingLayout() {
  const screenOptions = useStackScreenOptions();
  const hasHDWallet = useUserStore(state => state.account.hasHDWallet);
  const walletsCount = useUserStore(state => state.wallet.wallets.length);
  const appLockPassword = useOnboardingSessionStore(state => state.appLockPassword);
  const hasPendingBackup = walletsCount > 0 && !hasHDWallet;
  const hasAppLockPassword = Boolean(appLockPassword);

  return (
    <Stack
      initialRouteName={hasPendingBackup ? 'backup-prompt' : 'index'}
      screenOptions={screenOptions}
    >
      <Stack.Protected guard={!hasPendingBackup}>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="create-wallet" options={{ headerShown: false }} />
        <Stack.Screen name="import-phrase" />
      </Stack.Protected>
      <Stack.Screen name="backup-prompt" options={{ headerShown: false }} />
      <Stack.Protected guard={hasAppLockPassword}>
        <Stack.Screen name="backup-intro" options={{ headerShown: false }} />
        <Stack.Screen name="backup-phrase" options={{ headerShown: false }} />
        <Stack.Screen name="confirm-phrase" options={{ headerShown: false }} />
      </Stack.Protected>
      <Stack.Screen name="done" options={{ headerShown: false }} />
    </Stack>
  );
}
