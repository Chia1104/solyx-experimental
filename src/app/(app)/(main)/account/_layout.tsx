import { Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';

import {
  iosTransparentHeaderOptions,
  useStackScreenOptions,
} from '@/hooks/use-stack-screen-options';
import { useOnboardingSessionStore } from '@/modules/onboarding/stores/onboarding-session';

export default function AccountLayout() {
  const { t } = useTranslation(['defi']);
  const screenOptions = useStackScreenOptions();
  const appLockPassword = useOnboardingSessionStore(state => state.appLockPassword);
  const hasAppLockPassword = Boolean(appLockPassword);

  const headerOptions = iosTransparentHeaderOptions;

  return (
    <Stack screenOptions={screenOptions}>
      <Stack.Screen
        name="manage"
        options={{ title: t('defi:title.manage.accounts'), ...headerOptions }}
      />
      <Stack.Screen
        name="[id]"
        options={{ title: t('defi:title.account.setting'), ...headerOptions }}
      />
      <Stack.Screen
        name="edit-info"
        options={{ title: t('defi:title.account.info'), ...headerOptions }}
      />
      <Stack.Screen
        name="add"
        options={{ title: t('defi:title.add.an.account'), ...headerOptions }}
      />
      <Stack.Screen
        name="add-info"
        options={{ title: t('defi:title.account.info'), ...headerOptions }}
      />
      <Stack.Screen
        name="import-private-key"
        options={{ title: t('defi:title.import'), ...headerOptions }}
      />
      <Stack.Screen
        name="export-private-key"
        options={{ title: t('defi:title.export.private.key'), ...headerOptions }}
      />
      <Stack.Screen
        name="backup-intro"
        options={{ title: t('defi:title.back.up.seed.phrase'), ...headerOptions }}
      />
      <Stack.Protected guard={hasAppLockPassword}>
        <Stack.Screen
          name="backup-phrase"
          options={{ title: t('defi:title.back.up.seed.phrase'), ...headerOptions }}
        />
        <Stack.Screen
          name="backup-confirm-phrase"
          options={{ title: t('defi:title.seed.phrase.confirm'), ...headerOptions }}
        />
      </Stack.Protected>
    </Stack>
  );
}
