import type { PropsWithChildren } from 'react';
import { createRef } from 'react';

import type { BlurTargetViewProps, BlurViewProps } from 'expo-blur';
import { BlurTargetView, BlurView } from 'expo-blur';
import type { View } from 'react-native';
import { Platform } from 'react-native';
import type { SharedValue } from 'react-native-reanimated';
import Animated, { useAnimatedProps } from 'react-native-reanimated';

const RBlurView = Animated.createAnimatedComponent(BlurView);
const androidBlurTargetRef = createRef<View>();

interface Props extends BlurViewProps {
  blurIntensity: SharedValue<number>;
}

type AndroidBlurTargetViewProps = PropsWithChildren<Omit<BlurTargetViewProps, 'ref'>>;

export const AndroidBlurTargetView = (props: AndroidBlurTargetViewProps) => {
  if (Platform.OS === 'android') {
    return <BlurTargetView ref={androidBlurTargetRef} {...props} />;
  }

  return props.children;
};

export const AnimatedBlurView = ({ blurIntensity, blurMethod, blurTarget, ...props }: Props) => {
  const animatedProps = useAnimatedProps(() => {
    return {
      intensity: blurIntensity.get(),
    };
  });

  return (
    <RBlurView
      {...props}
      blurMethod={Platform.OS === 'android' ? 'dimezisBlurView' : blurMethod}
      blurTarget={Platform.OS === 'android' ? androidBlurTargetRef : blurTarget}
      animatedProps={animatedProps}
    />
  );
};
