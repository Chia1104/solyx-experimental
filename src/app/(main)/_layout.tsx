import { Tabs } from 'expo-router';

import { AutoLockEffect } from '@/modules/lockscreen/auto-lock-effect';
import { LockScreenOverlay } from '@/modules/lockscreen/lockscreen-overlay';
import { LockScreenProvider } from '@/modules/lockscreen/lockscreen-provider';

export default function DefiLayout() {
  return (
    <LockScreenProvider>
      <Tabs screenOptions={{ tabBarActiveTintColor: 'blue' }}>
        <Tabs.Screen
          name="index"
          options={{
            headerShown: false,
          }}
        />
      </Tabs>
      <LockScreenOverlay />
      <AutoLockEffect />
    </LockScreenProvider>
  );
}
