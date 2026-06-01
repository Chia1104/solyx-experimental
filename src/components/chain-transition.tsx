import { createContext, useCallback, use, useMemo, useRef, useState } from 'react';

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
const HOLD_MS = 700;
const FADE_OUT_MS = 280;

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
  const [isVisible, setIsVisible] = useState(false);
  const opacity = useSharedValue(0);
  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));
  const activeRef = useRef(false);

  const beginTransition = useCallback(() => {
    activeRef.current = true;
    setIsVisible(true);
    opacity.value = withTiming(1, { duration: FADE_IN_MS });
  }, [opacity]);

  const endTransition = useCallback(() => {
    if (!activeRef.current) return;
    activeRef.current = false;
    opacity.value = withDelay(
      HOLD_MS,
      withTiming(0, { duration: FADE_OUT_MS }, finished => {
        if (finished) {
          scheduleOnRN(setIsVisible, false);
        }
      }),
    );
  }, [opacity]);

  const value = useMemo(
    () => ({ beginTransition, endTransition }),
    [beginTransition, endTransition],
  );

  return (
    <ChainTransitionContext value={value}>
      <View style={{ flex: 1 }}>
        {children}
        {isVisible ? (
          <Animated.View className="absolute inset-0" pointerEvents="none" style={animatedStyle}>
            <Brand />
          </Animated.View>
        ) : null}
      </View>
    </ChainTransitionContext>
  );
};
