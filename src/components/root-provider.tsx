import { useLayoutEffect, useMemo } from 'react';

import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router/react-navigation';
import { usePreventScreenCapture } from 'expo-screen-capture';
import * as SystemUI from 'expo-system-ui';
import { HeroUINativeProvider } from 'heroui-native';
import { StatusBar } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Uniwind, useCSSVariable } from 'uniwind';

import { AndroidBlurTargetView, BlurTargetProvider } from '@/components/ui/animated-blur-view';
import { persistOptions, queryClient } from '@/libs/request/query-client';
import { LIQUID_CHAINS } from '@/modules/chain/stores/chain-adapter/chains';
import { useUserStore } from '@/modules/user/stores/user';

import { AppLoading } from './app-loading';

const INITIAL_LIGHT_BACKGROUND_COLOR = '#F7F7F7';

Uniwind.setTheme('light');
SystemUI.setBackgroundColorAsync(INITIAL_LIGHT_BACKGROUND_COLOR);

const getChainTheme = (chainId: number) =>
  Object.hasOwn(LIQUID_CHAINS, `${chainId}`) ? 'dark' : 'light';

export const RootProvider = ({ children }: { children: React.ReactNode }) => {
  usePreventScreenCapture();
  const currentChainId = useUserStore(state => state.wallet.currentChainId);
  const theme = useMemo(() => getChainTheme(currentChainId), [currentChainId]);
  const systemBackgroundColor =
    (useCSSVariable('--background') as string | undefined) ?? INITIAL_LIGHT_BACKGROUND_COLOR;

  useLayoutEffect(() => {
    Uniwind.setTheme(theme);
  }, [theme]);

  useLayoutEffect(() => {
    void SystemUI.setBackgroundColorAsync(systemBackgroundColor);
  }, [systemBackgroundColor, theme]);

  return (
    <PersistQueryClientProvider client={queryClient} persistOptions={persistOptions}>
      <ThemeProvider value={theme === 'dark' ? DarkTheme : DefaultTheme}>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <SafeAreaProvider>
            <BlurTargetProvider>
              <HeroUINativeProvider>
                <StatusBar
                  backgroundColor={systemBackgroundColor}
                  barStyle={theme === 'dark' ? 'light-content' : 'dark-content'}
                />
                <AndroidBlurTargetView style={{ flex: 1 }}>{children}</AndroidBlurTargetView>
                <AppLoading />
              </HeroUINativeProvider>
            </BlurTargetProvider>
          </SafeAreaProvider>
        </GestureHandlerRootView>
      </ThemeProvider>
    </PersistQueryClientProvider>
  );
};
