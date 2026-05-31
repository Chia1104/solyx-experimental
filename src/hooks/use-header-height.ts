import { useRef } from 'react';

import { useHeaderHeight as useHeaderHeightElements } from 'expo-router/react-navigation';
import { Platform, StatusBar } from 'react-native';

const DEFAULT_HEADER_BAR_HEIGHT = 56;

const getAndroidFallbackHeaderHeight = () =>
  (StatusBar.currentHeight ?? 0) + DEFAULT_HEADER_BAR_HEIGHT;

function useHeaderHeight(): number {
  const headerHeight = useHeaderHeightElements();
  const fixedHeight = useRef(headerHeight);

  if (Platform.OS === 'android') {
    if (headerHeight > fixedHeight.current) {
      fixedHeight.current = headerHeight;
    }

    if (fixedHeight.current <= 0) {
      return getAndroidFallbackHeaderHeight();
    }

    return fixedHeight.current;
  }

  return headerHeight;
}

export default useHeaderHeight;
