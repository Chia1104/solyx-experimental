import { Stack } from 'expo-router';

import { AccountAvatar, ScannerHeaderButton, SwitchMode } from '@/components/home/home-header';
import { useStackScreenOptions } from '@/hooks/use-stack-screen-options';
import { useQueryAssets } from '@/modules/defi/hooks/use-query-assets';

export default function HomeLayout() {
  const screenOptions = useStackScreenOptions();
  const { chain, wallet } = useQueryAssets();

  return (
    <Stack screenOptions={screenOptions}>
      <Stack.Screen
        name="index"
        options={{
          headerTitle: () => <SwitchMode chain={chain} />,
          headerLeft: () => <AccountAvatar wallet={wallet} />,
          headerRight: () => <ScannerHeaderButton />,
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
