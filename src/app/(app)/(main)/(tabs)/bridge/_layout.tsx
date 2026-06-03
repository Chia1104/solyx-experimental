import { Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';

import {
  iosTransparentHeaderOptions,
  useStackScreenOptions,
} from '@/hooks/use-stack-screen-options';

export default function SettingsLayout() {
  const { t } = useTranslation(['defi', 'global']);
  const screenOptions = useStackScreenOptions();

  return (
    <Stack screenOptions={screenOptions}>
      <Stack.Screen
        name="index"
        options={{
          title: t('title.bridge.create.order'),
          ...iosTransparentHeaderOptions,
        }}
      />
      <Stack.Screen
        name="confirm"
        options={{
          title: t('title.bridge.confirm.order'),
          ...iosTransparentHeaderOptions,
        }}
      />
    </Stack>
  );
}
