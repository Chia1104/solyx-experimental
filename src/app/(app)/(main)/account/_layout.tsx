import { Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { useStackScreenOptions } from '@/hooks/use-stack-screen-options';

export default function AccountLayout() {
  const { t } = useTranslation(['defi']);
  const screenOptions = useStackScreenOptions();

  return (
    <Stack screenOptions={screenOptions}>
      <Stack.Screen name="add" options={{ title: t('defi:title.add.an.account') }} />
      <Stack.Screen name="add-info" options={{ title: t('defi:title.account.info') }} />
      <Stack.Screen name="import-private-key" options={{ title: t('defi:title.import') }} />
      <Stack.Screen
        name="export-private-key"
        options={{ title: t('defi:title.export.private.key') }}
      />
    </Stack>
  );
}
