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
      googleServicesFile: './.firebase/GoogleService-Info.plist',
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false,
      },
      buildNumber: '8',
    },
    android: {
      backgroundColor: '#F7F7F7',
      versionCode: 8,
      version: '4.0.0-nightly.8',
      userInterfaceStyle: 'light',
      adaptiveIcon: {
        backgroundColor: '#E6F4FE',
        foregroundImage: './assets/images/android-icon-foreground.png',
        backgroundImage: './assets/images/android-icon-background.png',
        monochromeImage: './assets/images/android-icon-monochrome.png',
      },
      predictiveBackGestureEnabled: false,
      package: 'com.chia1104.solyxexperimental',
      googleServicesFile: './.firebase/google-services.json',
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
      'react-native-quick-crypto',
      'react-native-notify-kit',
      '@react-native-vector-icons/fontawesome',
      '@react-native-vector-icons/ionicons',
      '@react-native-vector-icons/material-design-icons',
      '@react-native-firebase/app',
      '@react-native-firebase/crashlytics',
      '@react-native-firebase/messaging',
      [
        './plugins/with-firebase-analytics-ios',
        {
          ios: {
            withoutAdIdSupport: true,
            googleAppMeasurementOnDeviceConversion: true,
          },
        },
      ],
      [
        'expo-build-properties',
        {
          ios: {
            useFrameworks: 'static',
            forceStaticLinking: ['RNFBAnalytics', 'RNFBApp', 'RNFBCrashlytics', 'RNFBMessaging'],
          },
        },
      ],
      [
        '@sentry/react-native/expo',
        {
          url: 'https://sentry.io/',
          project: process.env.SENTRY_PROJECT,
          organization: process.env.SENTRY_ORGANIZATION,
        },
      ],
      'expo-font',
      'expo-image',
      'expo-status-bar',
      'expo-web-browser',
      'expo-localization',
      // [
      //   'expo-localization',
      //   {
      //     fallbackLocale: 'en_us',
      //     availableLocales: ['en_us', 'zh_tw'],
      //   },
      // ],
    ],
    experiments: {
      typedRoutes: true,
      reactCompiler: true,
    },
  };
};
