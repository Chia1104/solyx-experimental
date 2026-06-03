import type { ScrollViewProps } from 'react-native';
import { Platform, ScrollView } from 'react-native';

import useHeaderHeight from '@/hooks/use-header-height';
import { useTabBarContentInset } from '@/hooks/use-tab-bar-content-inset';

interface TabScreenScrollViewProps extends ScrollViewProps {
  /** Reserve space for a transparent native stack header (see useStackScreenOptions). */
  stackHeaderInset?: boolean;
  tabBarAdditionalPadding?: number;
}

export const TabScreenScrollView = ({
  contentContainerStyle,
  stackHeaderInset = false,
  tabBarAdditionalPadding = 0,
  ...props
}: TabScreenScrollViewProps) => {
  const paddingBottom = useTabBarContentInset(tabBarAdditionalPadding);
  const headerHeight = useHeaderHeight();

  return (
    <ScrollView
      {...props}
      contentContainerStyle={[
        stackHeaderInset && Platform.OS === 'ios' ? { paddingTop: headerHeight } : undefined,
        { paddingBottom },
        contentContainerStyle,
      ]}
    />
  );
};
