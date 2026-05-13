import { Tabs } from 'expo-router';

import { ThemedIcon } from '@/components/ui/themed-icon';

const TAB_BAR_ACTIVE_COLOR = '#2563eb';
const TAB_BAR_INACTIVE_COLOR = '#8a8a8f';

export default function DefiTabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: TAB_BAR_ACTIVE_COLOR,
        tabBarInactiveTintColor: TAB_BAR_INACTIVE_COLOR,
        tabBarStyle: {
          borderTopColor: 'rgba(142, 142, 147, 0.18)',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => <ThemedIcon color={color} name="home" size={size} />,
        }}
      />
      <Tabs.Screen
        name="bridge"
        options={{
          title: 'Bridge',
          tabBarIcon: ({ color, size }) => (
            <ThemedIcon color={color} name="swap-horizontal" size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="activity"
        options={{
          title: 'Activity',
          tabBarIcon: ({ color, size }) => <ThemedIcon color={color} name="time" size={size} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, size }) => <ThemedIcon color={color} name="settings" size={size} />,
        }}
      />
    </Tabs>
  );
}
