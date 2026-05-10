import { Slot } from 'expo-router';

import Brand from '@/components/brand';

export default function StartupLayout() {
  return (
    <Brand display={['brand', 'background']}>
      <Slot />
    </Brand>
  );
}
