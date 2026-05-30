import { isLiquidGlassAvailable } from 'expo-glass-effect';
import type { NativeStackNavigationOptions } from 'expo-router';
import { useThemeColor } from 'heroui-native';
import { Platform } from 'react-native';
import { useUniwind } from 'uniwind';

export const useStackScreenOptions = (): NativeStackNavigationOptions => {
  const { theme } = useUniwind();
  const isDark = theme === 'dark';
  const [themeColorForeground, themeColorBackground] = useThemeColor(['foreground', 'background']);

  return {
    headerTitleAlign: 'center',
    headerTransparent: true,
    headerBlurEffect: isDark ? 'dark' : 'light',
    headerTintColor: themeColorForeground,
    headerStyle: {
      backgroundColor: Platform.select({
        ios: undefined,
        android: themeColorBackground,
      }),
    },
    headerBackButtonDisplayMode: 'generic',
    gestureEnabled: true,
    gestureDirection: 'horizontal',
    fullScreenGestureEnabled: isLiquidGlassAvailable() ? false : true,
    contentStyle: {
      backgroundColor: themeColorBackground,
    },
  };
};
