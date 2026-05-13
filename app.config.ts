import type { ConfigContext, ExpoConfig } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => {
  return {
    ...config,
    name: 'solyx-experimental',
    slug: 'solyx-experimental',
    version: '4.0.0',
    orientation: 'portrait',
    icon: './assets/images/icon.png',
    scheme: process.env.EXPO_PUBLIC_DEEP_LINK_SCHEME?.replace('://', '') ?? 'solyx-experimental',
    backgroundColor: '#F7F7F7',
    userInterfaceStyle: 'light',
    ios: {
      icon: './assets/expo.icon',
      bundleIdentifier: 'com.chia1104.solyxexperimental',
    },
    android: {
      backgroundColor: '#F7F7F7',
      userInterfaceStyle: 'light',
      adaptiveIcon: {
        backgroundColor: '#E6F4FE',
        foregroundImage: './assets/images/android-icon-foreground.png',
        backgroundImage: './assets/images/android-icon-background.png',
        monochromeImage: './assets/images/android-icon-monochrome.png',
      },
      predictiveBackGestureEnabled: false,
      package: 'com.chia1104.solyxexperimental',
    },
    web: {
      output: 'static',
      favicon: './assets/images/favicon.png',
    },
    plugins: [
      'expo-router',
      [
        'expo-splash-screen',
        {
          backgroundColor: '#208AEF',
          android: {
            image: './assets/images/splash-icon.png',
            imageWidth: 76,
          },
        },
      ],
      'expo-secure-store',
      'expo-sqlite',
      'expo-localization',
      'expo-system-ui',
      'expo-build-properties',
      'react-native-quick-crypto',
    ],
    experiments: {
      typedRoutes: true,
      reactCompiler: true,
    },
  };
};
