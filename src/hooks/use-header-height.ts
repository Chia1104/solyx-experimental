import { useRef } from 'react';

import { useHeaderHeight as useHeaderHeightElements } from '@react-navigation/elements';
import { Platform } from 'react-native';

function useHeaderHeight(): number {
  const headerHeight = useHeaderHeightElements();
  const fixedHeight = useRef(headerHeight);

  return Platform.OS === 'android' ? fixedHeight.current : headerHeight;
}
export default useHeaderHeight;
