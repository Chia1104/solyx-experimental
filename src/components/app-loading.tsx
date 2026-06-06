import type { PropsWithChildren } from 'react';

import { BlurView } from 'expo-blur';
import { Spinner } from 'heroui-native';
import { Stepper } from 'heroui-native-pro/stepper';
import { Platform, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { FullWindowOverlay } from 'react-native-screens';
import { useUniwind } from 'uniwind';

import { useBlurTarget } from '@/components/ui/animated-blur-view';
import { useGlobalStore } from '@/modules/app/stores/global';

interface AppLoadingProps extends PropsWithChildren {
  spinnerColor?: string;
  spinnerSize?: 'sm' | 'md' | 'lg';
}

export const AppLoading = ({
  children,
  spinnerColor = 'default',
  spinnerSize = 'lg',
}: AppLoadingProps) => {
  const isLoading = useGlobalStore(store => store.isLoading);
  const loadingSteps = useGlobalStore(store => store.loadingSteps);
  const currentLoadingStep = useGlobalStore(store => store.currentLoadingStep);
  const { theme } = useUniwind();
  const isDark = theme === 'dark';
  const { targetRef } = useBlurTarget();

  if (!isLoading) return null;

  const overlay = (
    <Animated.View
      entering={FadeIn.duration(200)}
      exiting={FadeOut.duration(150)}
      style={[StyleSheet.absoluteFill, styles.overlay]}
      pointerEvents="auto"
    >
      <BlurView
        intensity={isDark ? 75 : 50}
        tint={isDark ? 'dark' : 'light'}
        blurMethod={Platform.OS === 'android' ? 'dimezisBlurViewSdk31Plus' : undefined}
        blurTarget={Platform.OS === 'android' ? targetRef : undefined}
        style={StyleSheet.absoluteFill}
      >
        <View className="flex-1 items-center justify-center px-8">
          {loadingSteps ? (
            <View className="w-full max-w-xs">
              <Stepper currentStep={currentLoadingStep} orientation="vertical">
                {loadingSteps.map((step, index) => (
                  <Stepper.Step key={index} disabled>
                    <Stepper.Rail />
                    <Stepper.Content>
                      <Stepper.Title>{step.title}</Stepper.Title>
                      {step.description ? (
                        <Stepper.Description>{step.description}</Stepper.Description>
                      ) : null}
                    </Stepper.Content>
                  </Stepper.Step>
                ))}
              </Stepper>
            </View>
          ) : (
            (children ?? <Spinner size={spinnerSize} color={spinnerColor} />)
          )}
        </View>
      </BlurView>
    </Animated.View>
  );

  if (Platform.OS === 'ios') {
    return <FullWindowOverlay>{overlay}</FullWindowOverlay>;
  }

  return overlay;
};

const styles = StyleSheet.create({
  overlay: {
    zIndex: 50,
  },
});
