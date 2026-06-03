import { Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { ActivityHeaderRight } from '@/components/activity/activity-header-right';
import {
  iosTransparentHeaderOptions,
  useStackScreenOptions,
} from '@/hooks/use-stack-screen-options';

export default function ActivityLayout() {
  const { t } = useTranslation(['defi']);
  const screenOptions = useStackScreenOptions();

  return (
    <Stack screenOptions={screenOptions}>
      <Stack.Screen
        name="index"
        options={{
          headerRight: () => <ActivityHeaderRight />,
          title: t('title.activity'),
          ...iosTransparentHeaderOptions,
        }}
      />
    </Stack>
  );
}
