import { createContext, use, useCallback, useMemo, useRef, useState } from 'react';
import type { PropsWithChildren, RefObject } from 'react';

import type { BlurTargetViewProps, BlurViewProps } from 'expo-blur';
import { BlurTargetView, BlurView } from 'expo-blur';
import type { View } from 'react-native';
import { Platform, View as RNView } from 'react-native';
import type { SharedValue } from 'react-native-reanimated';
import Animated, { useAnimatedProps } from 'react-native-reanimated';

const RBlurView = Animated.createAnimatedComponent(BlurView);

interface BlurTargetContextValue {
  isReady: boolean;
  setTargetNode: (node: View | null) => void;
  targetRef: RefObject<View | null>;
}

const BlurTargetContext = createContext<BlurTargetContextValue | null>(null);

export const BlurTargetProvider = ({ children }: PropsWithChildren) => {
  const targetRef = useRef<View | null>(null);
  const [isReady, setIsReady] = useState(false);

  const setTargetNode = useCallback((node: View | null) => {
    targetRef.current = node;
    setIsReady(node != null);
  }, []);

  const value = useMemo(
    () => ({
      isReady,
      setTargetNode,
      targetRef,
    }),
    [isReady, setTargetNode],
  );

  return <BlurTargetContext value={value}>{children}</BlurTargetContext>;
};

const useBlurTarget = () => {
  const context = use(BlurTargetContext);

  if (!context) {
    throw new Error('useBlurTarget must be used within BlurTargetProvider');
  }

  return context;
};

interface Props extends BlurViewProps {
  blurIntensity: SharedValue<number>;
}

type AndroidBlurTargetViewProps = PropsWithChildren<Omit<BlurTargetViewProps, 'ref'>>;

export const AndroidBlurTargetView = ({ children, ...props }: AndroidBlurTargetViewProps) => {
  const { setTargetNode } = useBlurTarget();

  if (Platform.OS !== 'android') {
    return children;
  }

  return (
    <BlurTargetView
      collapsable={false}
      ref={setTargetNode as unknown as RefObject<View | null>}
      {...props}
    >
      {children}
    </BlurTargetView>
  );
};

export const AnimatedBlurView = ({ blurIntensity, blurMethod, blurTarget, ...props }: Props) => {
  const { isReady, targetRef } = useBlurTarget();
  const animatedProps = useAnimatedProps(() => ({
    intensity: blurIntensity.get(),
  }));

  if (Platform.OS === 'android' && !isReady) {
    return <RNView {...props} />;
  }

  return (
    <RBlurView
      {...props}
      blurMethod={Platform.OS === 'android' ? 'dimezisBlurView' : blurMethod}
      blurTarget={Platform.OS === 'android' ? targetRef : blurTarget}
      animatedProps={animatedProps}
    />
  );
};
