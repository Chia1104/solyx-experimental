import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { HeroUINativeProvider } from 'heroui-native';
import { useColorScheme } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';

export const RootProvider = ({ children }: { children: React.ReactNode }) => {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <HeroUINativeProvider>
          <SafeAreaView style={{ flex: 1 }}>{children}</SafeAreaView>
        </HeroUINativeProvider>
      </GestureHandlerRootView>
    </ThemeProvider>
  );
};
