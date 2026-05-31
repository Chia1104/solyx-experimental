import { cn } from 'heroui-native';
import type { ViewProps } from 'react-native';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { TabBarContentInsetProvider } from '@/hooks/use-tab-bar-content-inset';

import type Brand from './brand';
import BrandRoot from './brand';

type SafeAreaEdge = 'top' | 'bottom' | 'left' | 'right';

interface PageProps extends ViewProps {
  brandProps?: React.ComponentProps<typeof Brand>;
  children?: React.ReactNode;
  edges?: SafeAreaEdge[] | 'all';
  isBrandVisible?: boolean;
  /** Measure NativeTabs tab bar inset for scroll content padding (iOS only). */
  tabBarInset?: boolean;
}

const DEFAULT_EDGES: SafeAreaEdge[] = ['top', 'left', 'right'];

const PageContent = ({
  children,
  className,
  edges = DEFAULT_EDGES,
  isBrandVisible = false,
  tabBarInset = false,
  ...props
}: PageProps) => {
  const insets = useSafeAreaInsets();

  if (edges === 'all') {
    edges = ['top', 'bottom', 'left', 'right'];
  }

  const content = (
    <View
      className={cn('flex-1', !isBrandVisible && 'bg-background')}
      style={{
        paddingBottom: edges.includes('bottom') ? insets.bottom : 0,
        paddingLeft: edges.includes('left') ? insets.left : 0,
        paddingRight: edges.includes('right') ? insets.right : 0,
        paddingTop: edges.includes('top') ? insets.top : 0,
      }}
    >
      <View className={cn('flex-1', className)} {...props}>
        {children}
      </View>
    </View>
  );

  if (!tabBarInset) {
    return content;
  }

  return <TabBarContentInsetProvider>{content}</TabBarContentInsetProvider>;
};

export const Page = ({
  brandProps,
  children,
  className,
  edges,
  isBrandVisible = false,
  tabBarInset = false,
  ...props
}: PageProps) => {
  if (!isBrandVisible) {
    return (
      <PageContent className={className} edges={edges} tabBarInset={tabBarInset} {...props}>
        {children}
      </PageContent>
    );
  }

  return (
    <BrandRoot display={['background']} {...brandProps}>
      <PageContent
        className={className}
        edges={edges}
        isBrandVisible
        tabBarInset={tabBarInset}
        {...props}
      >
        {children}
      </PageContent>
    </BrandRoot>
  );
};
