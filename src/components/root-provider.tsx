import { useLayoutEffect, useMemo } from 'react';

import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { QueryClientProvider } from '@tanstack/react-query';
import * as SystemUI from 'expo-system-ui';
import { HeroUINativeProvider } from 'heroui-native';
import { StatusBar } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Uniwind, useCSSVariable } from 'uniwind';

import { queryClient } from '@/libs/request/query-client';
import { LIQUID_CHAINS } from '@/modules/chain/stores/chain-adapter/chains';
import { useUserStore } from '@/modules/user/stores/user';

const INITIAL_LIGHT_BACKGROUND_COLOR = '#F7F7F7';

Uniwind.setTheme('light');
SystemUI.setBackgroundColorAsync(INITIAL_LIGHT_BACKGROUND_COLOR);

const getChainTheme = (chainId: number) =>
  Object.hasOwn(LIQUID_CHAINS, `${chainId}`) ? 'dark' : 'light';

export const RootProvider = ({ children }: { children: React.ReactNode }) => {
  const currentChainId = useUserStore(state => state.wallet.currentChainId);
  const theme = useMemo(() => getChainTheme(currentChainId), [currentChainId]);
  const systemBackgroundColor =
    (useCSSVariable('--background') as string | undefined) ?? INITIAL_LIGHT_BACKGROUND_COLOR;

  useLayoutEffect(() => {
    Uniwind.setTheme(theme);
    void SystemUI.setBackgroundColorAsync(systemBackgroundColor);
  }, [systemBackgroundColor, theme]);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider value={theme === 'dark' ? DarkTheme : DefaultTheme}>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <HeroUINativeProvider>
            <StatusBar
              backgroundColor={systemBackgroundColor}
              barStyle={theme === 'dark' ? 'light-content' : 'dark-content'}
            />
            <SafeAreaView style={{ flex: 1 }}>{children}</SafeAreaView>
          </HeroUINativeProvider>
        </GestureHandlerRootView>
      </ThemeProvider>
    </QueryClientProvider>
  );
};
