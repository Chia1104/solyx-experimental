import { Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { useStackScreenOptions } from '@/hooks/use-stack-screen-options';
import { useOnboardingSessionStore } from '@/modules/onboarding/stores/onboarding-session';

export default function AccountLayout() {
  const { t } = useTranslation(['defi']);
  const screenOptions = useStackScreenOptions();
  const appLockPassword = useOnboardingSessionStore(state => state.appLockPassword);
  const hasAppLockPassword = Boolean(appLockPassword);

  return (
    <Stack screenOptions={screenOptions}>
      <Stack.Screen name="manage" options={{ title: t('defi:title.manage.accounts') }} />
      <Stack.Screen name="[id]" options={{ title: t('defi:title.account.setting') }} />
      <Stack.Screen name="edit-info" options={{ title: t('defi:title.account.info') }} />
      <Stack.Screen name="add" options={{ title: t('defi:title.add.an.account') }} />
      <Stack.Screen name="add-info" options={{ title: t('defi:title.account.info') }} />
      <Stack.Screen name="import-private-key" options={{ title: t('defi:title.import') }} />
      <Stack.Screen
        name="export-private-key"
        options={{ title: t('defi:title.export.private.key') }}
      />
      <Stack.Screen name="backup-intro" options={{ title: t('defi:title.back.up.seed.phrase') }} />
      <Stack.Protected guard={hasAppLockPassword}>
        <Stack.Screen
          name="backup-phrase"
          options={{ title: t('defi:title.back.up.seed.phrase') }}
        />
        <Stack.Screen
          name="backup-confirm-phrase"
          options={{ title: t('defi:title.seed.phrase.confirm') }}
        />
      </Stack.Protected>
    </Stack>
  );
}
