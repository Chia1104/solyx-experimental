import { Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { useStackScreenOptions } from '@/hooks/use-stack-screen-options';

export default function SendLayout() {
  const { t } = useTranslation(['defi']);
  const screenOptions = useStackScreenOptions();

  return (
    <Stack screenOptions={screenOptions}>
      <Stack.Screen name="index" options={{ title: t('title.selectToken') }} />
      <Stack.Screen name="[token]" options={{ title: t('title.sendTo') }} />
      <Stack.Screen name="amount" options={{ title: t('title.amount') }} />
      <Stack.Screen name="confirm" options={{ title: t('title.confirm') }} />
    </Stack>
  );
}
