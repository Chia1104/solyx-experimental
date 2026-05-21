import { Tabs } from 'expo-router';
import { useThemeColor } from 'heroui-native';
import { useTranslation } from 'react-i18next';

import { ActivityIcon, HomeIcon, SettingsIcon, SwapIcon } from '@/components/icons/defi-tab-icons';

export default function DefiTabsLayout() {
  const { t } = useTranslation(['defi']);
  const [accentColor, inactiveColor, surfaceColor, surfaceSecondaryColor] = useThemeColor([
    'accent',
    'field-placeholder',
    'surface',
    'surface-secondary',
  ]);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: accentColor,
        tabBarInactiveTintColor: inactiveColor,
        tabBarIconStyle: {
          marginBottom: 2,
        },
        tabBarItemStyle: {
          paddingTop: 10,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
          lineHeight: 16,
        },
        tabBarStyle: {
          backgroundColor: surfaceColor,
          borderTopColor: surfaceSecondaryColor,
          borderTopWidth: 1,
          height: 90,
          paddingBottom: 14,
          paddingTop: 8,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t('tab.home'),
          tabBarIcon: ({ color }) => <HomeIcon color={color} />,
        }}
      />
      <Tabs.Screen
        name="bridge"
        options={{
          title: t('tab.bridge'),
          tabBarIcon: ({ color }) => <SwapIcon color={color} />,
        }}
      />
      <Tabs.Screen
        name="activity"
        options={{
          title: t('tab.activity'),
          tabBarIcon: ({ color }) => <ActivityIcon color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: t('tab.setting'),
          tabBarIcon: ({ color }) => <SettingsIcon color={color} />,
        }}
      />
    </Tabs>
  );
}
