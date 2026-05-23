import { cn } from 'heroui-native';
import type { ViewProps } from 'react-native';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type Brand from './brand';
import BrandRoot from './brand';

type SafeAreaEdge = 'top' | 'bottom' | 'left' | 'right';

interface PageProps extends ViewProps {
  brandProps?: React.ComponentProps<typeof Brand>;
  children?: React.ReactNode;
  edges?: SafeAreaEdge[];
  isBrandVisible?: boolean;
}

const DEFAULT_EDGES: SafeAreaEdge[] = ['top', 'left', 'right'];

const PageContent = ({
  children,
  className,
  edges = DEFAULT_EDGES,
  isBrandVisible = false,
  ...props
}: PageProps) => {
  const insets = useSafeAreaInsets();

  return (
    <View className={cn('flex-1', !isBrandVisible && 'bg-background')}>
      <View
        className={cn('flex-1', className)}
        style={{
          paddingBottom: edges.includes('bottom') ? insets.bottom : 0,
          paddingLeft: edges.includes('left') ? insets.left : 0,
          paddingRight: edges.includes('right') ? insets.right : 0,
          paddingTop: edges.includes('top') ? insets.top : 0,
        }}
        {...props}
      >
        {children}
      </View>
    </View>
  );
};

export const Page = ({
  brandProps,
  children,
  className,
  edges,
  isBrandVisible = false,
  ...props
}: PageProps) => {
  if (!isBrandVisible) {
    return (
      <PageContent className={className} edges={edges} {...props}>
        {children}
      </PageContent>
    );
  }

  return (
    <BrandRoot display={['background']} {...brandProps}>
      <PageContent className={className} edges={edges} isBrandVisible {...props}>
        {children}
      </PageContent>
    </BrandRoot>
  );
};
