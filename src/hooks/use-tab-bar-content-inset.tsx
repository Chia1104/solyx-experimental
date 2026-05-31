import type { PropsWithChildren } from 'react';
import { createContext, use, useCallback, useRef, useState } from 'react';

import { Platform, View } from 'react-native';
import { SafeAreaView as NativeSafeAreaView } from 'react-native-screens/experimental';

const TabBarContentInsetContext = createContext(0);

const IosTabBarContentInsetProvider = ({ children }: PropsWithChildren) => {
  const [bottomInset, setBottomInset] = useState(0);
  const fullHeightRef = useRef(0);
  const safeHeightRef = useRef(0);

  const updateInset = useCallback(() => {
    const fullHeight = fullHeightRef.current;
    if (fullHeight <= 0) {
      return;
    }

    const nextInset = Math.max(0, Math.round(fullHeight - safeHeightRef.current));
    setBottomInset(current => (current === nextInset ? current : nextInset));
  }, []);

  return (
    <TabBarContentInsetContext value={bottomInset}>
      <View className="flex-1">
        {children}
        <View
          className="pointer-events-none absolute inset-0"
          onLayout={event => {
            fullHeightRef.current = event.nativeEvent.layout.height;
            updateInset();
          }}
        >
          <NativeSafeAreaView collapsable={false} edges={{ bottom: true }} style={{ flex: 1 }}>
            <View
              className="flex-1"
              onLayout={event => {
                safeHeightRef.current = event.nativeEvent.layout.height;
                updateInset();
              }}
            />
          </NativeSafeAreaView>
        </View>
      </View>
    </TabBarContentInsetContext>
  );
};

export const TabBarContentInsetProvider = ({ children }: PropsWithChildren) => {
  if (Platform.OS !== 'ios') {
    return <TabBarContentInsetContext value={0}>{children}</TabBarContentInsetContext>;
  }

  return <IosTabBarContentInsetProvider>{children}</IosTabBarContentInsetProvider>;
};

export const useTabBarContentInset = (additionalPadding = 0) => {
  const inset = use(TabBarContentInsetContext);

  if (Platform.OS !== 'ios') {
    return additionalPadding;
  }

  return inset + additionalPadding;
};
