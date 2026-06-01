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
          headerShadowVisible: false,
          headerStyle: {
            backgroundColor: 'transparent',
          },
          headerBlurEffect: undefined,
        }}
      />
      <Stack.Screen
        name="account"
        options={{
          title: t('title.accounts'),
          headerShadowVisible: false,
          headerStyle: {
            backgroundColor: 'transparent',
          },
          headerBlurEffect: undefined,
        }}
      />
      <Stack.Screen
        name="email"
        options={{
          title: t('defi:kyc.email'),
          headerShadowVisible: false,
          headerStyle: {
            backgroundColor: 'transparent',
          },
          headerBlurEffect: undefined,
        }}
      />
      <Stack.Screen
        name="language"
        options={{
          title: t('global:title.language'),
          headerShadowVisible: false,
          headerStyle: {
            backgroundColor: 'transparent',
          },
          headerBlurEffect: undefined,
        }}
      />
      <Stack.Screen
        name="contact-us"
        options={{
          title: t('defi:label.setting.contact.us'),
          headerShadowVisible: false,
          headerStyle: {
            backgroundColor: 'transparent',
          },
          headerBlurEffect: undefined,
        }}
      />
    </Stack>
  );
}
