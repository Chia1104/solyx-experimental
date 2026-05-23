import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';

import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import * as SystemUI from 'expo-system-ui';
import { HeroUINativeProvider } from 'heroui-native';
import { StatusBar } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
import { Uniwind, useCSSVariable } from 'uniwind';

import Brand from '@/components/brand';
import { persistOptions, queryClient } from '@/libs/request/query-client';
import { LIQUID_CHAINS } from '@/modules/chain/stores/chain-adapter/chains';
import { useUserStore } from '@/modules/user/stores/user';
import { delay } from '@/utils/delay';

const INITIAL_LIGHT_BACKGROUND_COLOR = '#F7F7F7';
const THEME_TRANSITION_TOTAL_MS = 1_500;
const THEME_TRANSITION_FADE_IN_MS = 280;
const THEME_TRANSITION_FADE_OUT_MS = 280;
const THEME_TRANSITION_HOLD_MS =
  THEME_TRANSITION_TOTAL_MS - THEME_TRANSITION_FADE_IN_MS - THEME_TRANSITION_FADE_OUT_MS;

Uniwind.setTheme('light');
SystemUI.setBackgroundColorAsync(INITIAL_LIGHT_BACKGROUND_COLOR);

const getChainTheme = (chainId: number) =>
  Object.hasOwn(LIQUID_CHAINS, `${chainId}`) ? 'dark' : 'light';

export const RootProvider = ({ children }: { children: React.ReactNode }) => {
  const currentChainId = useUserStore(state => state.wallet.currentChainId);
  const theme = useMemo(() => getChainTheme(currentChainId), [currentChainId]);
  const systemBackgroundColor =
    (useCSSVariable('--background') as string | undefined) ?? INITIAL_LIGHT_BACKGROUND_COLOR;
  const previousThemeRef = useRef(theme);
  const [isThemeTransitionVisible, setIsThemeTransitionVisible] = useState(false);
  const transitionOpacity = useSharedValue(0);
  const transitionStyle = useAnimatedStyle(() => ({
    opacity: transitionOpacity.value,
  }));

  useLayoutEffect(() => {
    if (previousThemeRef.current !== theme) {
      setIsThemeTransitionVisible(true);
      transitionOpacity.value = 0;
      previousThemeRef.current = theme;
    }

    Uniwind.setTheme(theme);
  }, [theme, transitionOpacity]);

  useLayoutEffect(() => {
    void SystemUI.setBackgroundColorAsync(systemBackgroundColor);
  }, [systemBackgroundColor, theme]);

  useEffect(() => {
    if (!isThemeTransitionVisible) {
      return;
    }

    transitionOpacity.value = withTiming(1, { duration: THEME_TRANSITION_FADE_IN_MS });

    let isCancelled = false;

    void delay(THEME_TRANSITION_FADE_IN_MS + THEME_TRANSITION_HOLD_MS).then(() => {
      if (isCancelled) return;
      transitionOpacity.value = withTiming(
        0,
        { duration: THEME_TRANSITION_FADE_OUT_MS },
        isFinished => {
          if (isFinished) {
            scheduleOnRN(setIsThemeTransitionVisible, false);
          }
        },
      );
    });

    return () => {
      isCancelled = true;
    };
  }, [isThemeTransitionVisible, transitionOpacity]);

  return (
    <PersistQueryClientProvider client={queryClient} persistOptions={persistOptions}>
      <ThemeProvider value={theme === 'dark' ? DarkTheme : DefaultTheme}>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <HeroUINativeProvider>
            <StatusBar
              backgroundColor={systemBackgroundColor}
              barStyle={theme === 'dark' ? 'light-content' : 'dark-content'}
            />
            {children}
            {isThemeTransitionVisible ? (
              <Animated.View
                className="absolute inset-0"
                pointerEvents="none"
                style={transitionStyle}
              >
                <Brand />
              </Animated.View>
            ) : null}
          </HeroUINativeProvider>
        </GestureHandlerRootView>
      </ThemeProvider>
    </PersistQueryClientProvider>
  );
};
