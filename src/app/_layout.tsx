import '@/global.css';
import '@/libs/translations';
import { Stack } from 'expo-router';

import { AppGuard } from '@/components/app-guard';
import Brand from '@/components/brand';
import { RootProvider } from '@/components/root-provider';
import { globalInit } from '@/modules/app/utils';

globalInit();

export default function RootLayout() {
  return (
    <RootProvider>
      <AppGuard fallback={<Brand />}>
        {data => (
          <Stack>
            <Stack.Protected guard={!data.canProceed}>
              <Stack.Screen name="fallback" options={{ headerShown: false }} />
            </Stack.Protected>
            <Stack.Protected guard={data.canProceed}>
              <Stack.Screen name="(app)" options={{ headerShown: false }} />
            </Stack.Protected>
          </Stack>
        )}
      </AppGuard>
    </RootProvider>
  );
}
