import '@/global.css';
import '@/libs/translations';
import { Stack } from 'expo-router';
import { Text } from 'react-native';

import { AppGuard } from '@/components/app-guard';
import { AppStatusContext } from '@/components/app-status-context';
import { RootProvider } from '@/components/root-provider';

export default function RootLayout() {
  return (
    <RootProvider>
      <AppGuard fallback={<Text>Loading...</Text>}>
        {data => (
          <AppStatusContext.Provider value={data}>
            <Stack>
              <Stack.Protected guard={!data.canProceed}>
                <Stack.Screen name="startup" options={{ headerShown: false }} />
              </Stack.Protected>
              <Stack.Protected guard={data.canProceed}>
                <Stack.Screen name="(main)" options={{ headerShown: false }} />
              </Stack.Protected>
            </Stack>
          </AppStatusContext.Provider>
        )}
      </AppGuard>
    </RootProvider>
  );
}
