import { createContext, useCallback, use, useMemo, useRef, useState } from 'react';

import { useThemeColor } from 'heroui-native';
import { View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import Brand from '@/components/brand';

export const FADE_IN_MS = 280;
const CROSSFADE_MS = 350;
const HOLD_MS = 150;
const FADE_OUT_MS = 280;

interface FrozenColors {
  background: string;
  foreground: string;
  accent: string;
}

interface ChainTransitionContextValue {
  beginTransition: () => void;
  endTransition: () => void;
}

const ChainTransitionContext = createContext<ChainTransitionContextValue>({
  beginTransition: () => undefined,
  endTransition: () => undefined,
});

export const useChainTransition = () => use(ChainTransitionContext);

export const ChainTransitionProvider = ({ children }: { children: React.ReactNode }) => {
  const [bgColor, fgColor, accentColor] = useThemeColor(['background', 'foreground', 'accent']);
  const [isVisible, setIsVisible] = useState(false);
  const [frozenColors, setFrozenColors] = useState<FrozenColors | null>(null);

  const opacity = useSharedValue(0);
  const crossfadeOpacity = useSharedValue(1);
  const activeRef = useRef(false);

  const currentColorsRef = useRef<FrozenColors>({
    background: bgColor,
    foreground: fgColor,
    accent: accentColor,
  });
  currentColorsRef.current = { background: bgColor, foreground: fgColor, accent: accentColor };

  const opacityStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));
  const crossfadeStyle = useAnimatedStyle(() => ({ opacity: crossfadeOpacity.value }));

  const beginTransition = useCallback(() => {
    activeRef.current = true;
    setFrozenColors({ ...currentColorsRef.current });
    crossfadeOpacity.value = 1;
    setIsVisible(true);
    opacity.value = withTiming(1, { duration: FADE_IN_MS });
  }, [opacity, crossfadeOpacity]);

  const endTransition = useCallback(() => {
    if (!activeRef.current) return;
    activeRef.current = false;
    crossfadeOpacity.value = withTiming(0, { duration: CROSSFADE_MS }, finished => {
      if (finished) {
        opacity.value = withDelay(
          HOLD_MS,
          withTiming(0, { duration: FADE_OUT_MS }, fin => {
            if (fin) {
              scheduleOnRN(setIsVisible, false);
            }
          }),
        );
      }
    });
  }, [opacity, crossfadeOpacity]);

  const value = useMemo(
    () => ({ beginTransition, endTransition }),
    [beginTransition, endTransition],
  );

  return (
    <ChainTransitionContext value={value}>
      <View style={{ flex: 1 }}>
        {children}
        {isVisible ? (
          <Animated.View className="absolute inset-0" pointerEvents="none" style={opacityStyle}>
            <Brand />
            <Animated.View className="absolute inset-0" pointerEvents="none" style={crossfadeStyle}>
              <Brand overrideColors={frozenColors ?? undefined} />
            </Animated.View>
          </Animated.View>
        ) : null}
      </View>
    </ChainTransitionContext>
  );
};
