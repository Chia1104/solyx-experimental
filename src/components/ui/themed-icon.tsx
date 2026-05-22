import type { ComponentProps } from 'react';

import { FontAwesome } from '@react-native-vector-icons/fontawesome/static';
import { Ionicons } from '@react-native-vector-icons/ionicons/static';
import { MaterialDesignIcons } from '@react-native-vector-icons/material-design-icons/static';
import { cn } from 'heroui-native';
import { withUniwind } from 'uniwind';

const UniwindIonicons = withUniwind(Ionicons);
const UniwindMaterialDesignIcons = withUniwind(MaterialDesignIcons);
const UniwindFontAwesome = withUniwind(FontAwesome);

type ThemedIconProps = ComponentProps<typeof UniwindIonicons>;
type ThemedMaterialDesignIconProps = ComponentProps<typeof UniwindMaterialDesignIcons>;
type ThemedFontAwesomeIconProps = ComponentProps<typeof UniwindFontAwesome>;

export const ThemedIcon = ({ className, ...props }: ThemedIconProps) => (
  <UniwindIonicons className={cn('text-muted', className)} {...props} />
);

export const ThemedMaterialDesignIcon = ({
  className,
  ...props
}: ThemedMaterialDesignIconProps) => (
  <UniwindMaterialDesignIcons className={cn('text-muted', className)} {...props} />
);

export const ThemedFontAwesomeIcon = ({ className, ...props }: ThemedFontAwesomeIconProps) => (
  <UniwindFontAwesome className={cn('text-muted', className)} {...props} />
);
