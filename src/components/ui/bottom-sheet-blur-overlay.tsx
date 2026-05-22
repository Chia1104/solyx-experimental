import { useBottomSheet, useBottomSheetAnimation } from 'heroui-native';
import { Pressable, StyleSheet } from 'react-native';
import Animated, { interpolate, useDerivedValue } from 'react-native-reanimated';
import { useUniwind } from 'uniwind';

import { AnimatedBlurView } from './animated-blur-view';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const BottomSheetBlurOverlay = () => {
  const { theme } = useUniwind();
  const isDark = theme === 'dark';

  const { isOpen, onOpenChange } = useBottomSheet();
  const { progress } = useBottomSheetAnimation();

  const blurIntensity = useDerivedValue(() => {
    return interpolate(progress.get(), [0, 1, 2], [0, 40, 0]);
  });

  if (!isOpen) {
    return null;
  }

  return (
    <AnimatedPressable style={StyleSheet.absoluteFill} onPress={() => onOpenChange(false)}>
      <AnimatedBlurView
        blurIntensity={blurIntensity}
        tint={isDark ? 'dark' : 'systemUltraThinMaterialDark'}
        style={StyleSheet.absoluteFill}
      />
    </AnimatedPressable>
  );
};
