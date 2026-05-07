import { Slot } from 'expo-router';
import '@/global.css';

import { RootProvider } from '@/components/root-provider';

export default function RootLayout() {
  return (
    <RootProvider>
      <Slot />
    </RootProvider>
  );
}
