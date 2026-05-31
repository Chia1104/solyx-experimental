import { useEffect } from 'react';
import type { ReactNode } from 'react';

import { StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

interface ActivityTabPanelProps {
  activeTab: string;
  children: ReactNode;
  tab: string;
}

export const ActivityTabPanel = ({ activeTab, children, tab }: ActivityTabPanelProps) => {
  const isActive = activeTab === tab;
  const opacity = useSharedValue(isActive ? 1 : 0);

  useEffect(() => {
    opacity.value = withTiming(isActive ? 1 : 0, { duration: 200 });
  }, [isActive, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      pointerEvents={isActive ? 'auto' : 'none'}
      style={[StyleSheet.absoluteFill, animatedStyle]}
      className="min-h-0"
    >
      {children}
    </Animated.View>
  );
};
