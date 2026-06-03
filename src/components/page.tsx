import { cn } from 'heroui-native';
import type { ViewProps } from 'react-native';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { TabBarContentInsetProvider } from '@/hooks/use-tab-bar-content-inset';

import BrandRoot from './brand';

type SafeAreaEdge = 'top' | 'bottom' | 'left' | 'right';

// ─────────────────────────────────────────────────────────────────────────────
// PageInner — shared safe-area + background container
// ─────────────────────────────────────────────────────────────────────────────

const DEFAULT_EDGES: SafeAreaEdge[] = ['top', 'left', 'right'];

interface PageInnerProps extends ViewProps {
  children?: React.ReactNode;
  edges?: SafeAreaEdge[] | 'all';
  tabBarInset?: boolean;
  withBackground?: boolean;
}

const PageInner = ({
  children,
  className,
  edges = DEFAULT_EDGES,
  tabBarInset = false,
  withBackground = true,
  ...props
}: PageInnerProps) => {
  const insets = useSafeAreaInsets();
  const resolved: SafeAreaEdge[] = edges === 'all' ? ['top', 'bottom', 'left', 'right'] : edges;

  const content = (
    <View
      className={cn('flex-1', withBackground && 'bg-background')}
      style={{
        paddingTop: resolved.includes('top') ? insets.top : 0,
        paddingBottom: resolved.includes('bottom') ? insets.bottom : 0,
        paddingLeft: resolved.includes('left') ? insets.left : 0,
        paddingRight: resolved.includes('right') ? insets.right : 0,
      }}
    >
      <View className={cn('flex-1', className)} {...props}>
        {children}
      </View>
    </View>
  );

  return tabBarInset ? <TabBarContentInsetProvider>{content}</TabBarContentInsetProvider> : content;
};

// ─────────────────────────────────────────────────────────────────────────────
// Page — escape hatch with full control
// ─────────────────────────────────────────────────────────────────────────────

interface PageProps extends Omit<PageInnerProps, 'withBackground'> {
  /**
   * Render a brand background behind the page.
   * `true` uses default BrandRoot props; pass an object to customise
   * (e.g. `{ display: ['brand', 'background'] }` to also show the logo).
   */
  brand?: boolean | Omit<React.ComponentProps<typeof BrandRoot>, 'children'>;
}

const PageRoot = ({ brand, children, className, edges, tabBarInset, ...props }: PageProps) => {
  const hasBrand = !!brand;

  const inner = (
    <PageInner
      className={className}
      edges={edges}
      tabBarInset={tabBarInset}
      withBackground={!hasBrand}
      {...props}
    >
      {children}
    </PageInner>
  );

  if (!hasBrand) return inner;

  const brandExtraProps = typeof brand === 'object' ? brand : {};
  return (
    <BrandRoot display={['background']} {...brandExtraProps}>
      {inner}
    </BrandRoot>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Page.Tab — root screen of a NativeTab
// edges: left + right (header manages top; tab bar + tabBarInset manages bottom)
// ─────────────────────────────────────────────────────────────────────────────

type PageTabProps = Omit<PageInnerProps, 'edges' | 'tabBarInset' | 'withBackground'>;

const PageTab = ({ className, ...props }: PageTabProps) => (
  <PageInner edges={['left', 'right']} tabBarInset className={className} {...props} />
);

// ─────────────────────────────────────────────────────────────────────────────
// Page.Stack — screen pushed or presented as modal on a stack navigator
// edges: left + right + bottom (stack header manages top)
// ─────────────────────────────────────────────────────────────────────────────

type PageStackProps = Omit<PageInnerProps, 'edges' | 'tabBarInset' | 'withBackground'>;

const PageStack = ({ className, ...props }: PageStackProps) => (
  <PageInner edges={['left', 'right', 'bottom']} className={className} {...props} />
);

// ─────────────────────────────────────────────────────────────────────────────
// Page.Brand — standalone brand page (auth, onboarding, app-lock)
// No navigator header → edges default to 'all'
// ─────────────────────────────────────────────────────────────────────────────

interface PageBrandProps extends Omit<PageInnerProps, 'withBackground'> {
  brandProps?: Omit<React.ComponentProps<typeof BrandRoot>, 'children'>;
}

const PageBrand = ({
  brandProps,
  children,
  className,
  edges = 'all',
  tabBarInset,
  ...props
}: PageBrandProps) => (
  <BrandRoot display={['background']} {...brandProps}>
    <PageInner
      className={className}
      edges={edges}
      tabBarInset={tabBarInset}
      withBackground={false}
      {...props}
    >
      {children}
    </PageInner>
  </BrandRoot>
);

export const Page = Object.assign(PageRoot, {
  /** Root screen of a NativeTab — left/right edges only, tabBarInset always on. */
  Tab: PageTab,
  /** Screen on a stack navigator — left/right/bottom edges, no top inset. */
  Stack: PageStack,
  /** Standalone brand page — all edges by default, brand background visible. */
  Brand: PageBrand,
});
