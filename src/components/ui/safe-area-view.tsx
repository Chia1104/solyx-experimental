import type { FC, PropsWithChildren } from 'react';

import { cn } from 'heroui-native';
import type { ViewProps } from 'react-native';
import { Platform, View } from 'react-native';
import type { AnimatedProps } from 'react-native-reanimated';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import useHeaderHeight from '@/hooks/use-header-height';

const AnimatedView = Animated.createAnimatedComponent(View);

interface Props extends AnimatedProps<ViewProps> {
  className?: string;
  contentContainerClassName?: string;
}

export const SafeAreaView: FC<PropsWithChildren<Props>> = ({ children, className, ...props }) => {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  return (
    <AnimatedView
      className={cn('bg-background', className)}
      style={{
        paddingTop: Platform.select({
          ios: headerHeight,
          android: 0,
        }),
        paddingBottom: insets.bottom + 32,
      }}
      {...props}
    >
      {children}
    </AnimatedView>
  );
};
