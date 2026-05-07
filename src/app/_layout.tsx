import '@/global.css';
import { Stack } from 'expo-router';

import { RootProvider } from '@/components/root-provider';

export default function RootLayout() {
  return (
    <RootProvider>
      <Stack>
        <Stack.Screen name="main" options={{ headerShown: false }} />
      </Stack>
    </RootProvider>
  );
}
