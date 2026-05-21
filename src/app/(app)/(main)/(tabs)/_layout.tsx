import { Tabs } from 'expo-router';
import { useThemeColor } from 'heroui-native';
import { useTranslation } from 'react-i18next';
import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ActivityIcon, HomeIcon, SettingsIcon, SwapIcon } from '@/components/icons/defi-tab-icons';

const TAB_BAR_CONTENT_HEIGHT = 72;
const TAB_BAR_TOP_PADDING = 8;
const TAB_BAR_MIN_BOTTOM_PADDING = 8;

export default function DefiTabsLayout() {
  const { t } = useTranslation(['defi']);
  const { bottom: bottomInset } = useSafeAreaInsets();
  const [accentColor, inactiveColor, surfaceColor, surfaceSecondaryColor] = useThemeColor([
    'accent',
    'field-placeholder',
    'surface',
    'surface-secondary',
  ]);
  const tabBarBottomPadding =
    Platform.OS === 'android'
      ? Math.max(bottomInset, TAB_BAR_MIN_BOTTOM_PADDING)
      : bottomInset + TAB_BAR_MIN_BOTTOM_PADDING;
  const tabBarHeight = TAB_BAR_CONTENT_HEIGHT + TAB_BAR_TOP_PADDING + tabBarBottomPadding;

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
          height: tabBarHeight,
          paddingBottom: tabBarBottomPadding,
          paddingTop: TAB_BAR_TOP_PADDING,
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
