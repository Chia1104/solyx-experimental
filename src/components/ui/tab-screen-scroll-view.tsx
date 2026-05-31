import type { ScrollViewProps } from 'react-native';
import { ScrollView } from 'react-native';

import { useTabBarContentInset } from '@/hooks/use-tab-bar-content-inset';

interface TabScreenScrollViewProps extends ScrollViewProps {
  tabBarAdditionalPadding?: number;
}

export const TabScreenScrollView = ({
  contentContainerStyle,
  tabBarAdditionalPadding = 0,
  ...props
}: TabScreenScrollViewProps) => {
  const paddingBottom = useTabBarContentInset(tabBarAdditionalPadding);

  return (
    <ScrollView {...props} contentContainerStyle={[{ paddingBottom }, contentContainerStyle]} />
  );
};
