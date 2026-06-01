import { Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { useStackScreenOptions } from '@/hooks/use-stack-screen-options';

export default function SettingsLayout() {
  const { t } = useTranslation(['defi', 'global']);
  const screenOptions = useStackScreenOptions();

  return (
    <Stack screenOptions={screenOptions}>
      <Stack.Screen
        name="index"
        options={{
          title: t('title.setting'),
        }}
      />
      <Stack.Screen name="account" options={{ title: t('title.accounts') }} />
      <Stack.Screen name="email" options={{ title: t('defi:kyc.email') }} />
      <Stack.Screen name="language" options={{ title: t('global:title.language') }} />
      <Stack.Screen name="contact-us" options={{ title: t('defi:label.setting.contact.us') }} />
    </Stack>
  );
}
