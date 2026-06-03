import { Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';

import {
  iosTransparentHeaderOptions,
  useStackScreenOptions,
} from '@/hooks/use-stack-screen-options';

export default function SendLayout() {
  const { t } = useTranslation(['defi']);
  const screenOptions = useStackScreenOptions();

  const headerOptions = iosTransparentHeaderOptions;

  return (
    <Stack screenOptions={screenOptions}>
      <Stack.Screen name="index" options={{ title: t('title.selectToken'), ...headerOptions }} />
      <Stack.Screen name="[token]" options={{ title: t('title.sendTo'), ...headerOptions }} />
      <Stack.Screen name="amount" options={{ title: t('title.amount'), ...headerOptions }} />
      <Stack.Screen name="confirm" options={{ title: t('title.confirm'), ...headerOptions }} />
    </Stack>
  );
}
