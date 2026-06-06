import { Ionicons } from '@react-native-vector-icons/ionicons/static';
import { isLiquidGlassAvailable } from 'expo-glass-effect';
import type { NativeStackNavigationOptions } from 'expo-router';
import { useThemeColor } from 'heroui-native';
import { Platform } from 'react-native';
import { useUniwind } from 'uniwind';

import { BACK_ICON_NAME, BACK_ICON_SIZE } from '@/components/ui/back-button';

/** iOS: transparent header without blur. Android: omit — use `useStackScreenOptions` solid header. */
export const iosTransparentHeaderOptions = Platform.select({
  ios: {
    headerStyle: {
      backgroundColor: 'transparent',
    },
    headerBlurEffect: undefined,
  },
  default: {},
});

export const useStackScreenOptions = (): NativeStackNavigationOptions => {
  const { theme } = useUniwind();
  const isDark = theme === 'dark';
  const isIos = Platform.OS === 'ios';
  const [themeColorForeground, themeColorBackground] = useThemeColor(['foreground', 'background']);

  return {
    headerTitleAlign: 'center',
    headerShadowVisible: false,
    headerTransparent: isIos,
    headerBlurEffect: isIos ? (isDark ? 'dark' : 'light') : undefined,
    headerTintColor: themeColorForeground,
    headerStyle: {
      backgroundColor: isIos ? 'transparent' : themeColorBackground,
    },
    headerBackButtonDisplayMode: 'generic',
    headerBackIcon: {
      type: 'image',
      source: Ionicons.getImageSourceSync(BACK_ICON_NAME, BACK_ICON_SIZE, themeColorForeground),
    },
    gestureEnabled: true,
    gestureDirection: 'horizontal',
    fullScreenGestureEnabled: isLiquidGlassAvailable() ? false : true,
    contentStyle: {
      backgroundColor: themeColorBackground,
    },
  };
};
