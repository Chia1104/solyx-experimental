import type { ComponentProps, ReactElement, ReactNode, Ref } from 'react';
import { forwardRef, isValidElement, useImperativeHandle, useRef } from 'react';

import { cn } from 'heroui-native';
import type { StyleProp, TextProps, TextStyle } from 'react-native';
import { I18nManager, Text } from 'react-native';

type MD3TextVariant =
  | 'displayLarge'
  | 'displayMedium'
  | 'displaySmall'
  | 'headlineLarge'
  | 'headlineMedium'
  | 'headlineSmall'
  | 'titleLarge'
  | 'titleMedium'
  | 'titleSmall'
  | 'labelLarge'
  | 'labelMedium'
  | 'labelSmall'
  | 'bodyLarge'
  | 'bodyMedium'
  | 'bodySmall';

type LegacyTextType =
  | 'default'
  | 'title'
  | 'small'
  | 'smallBold'
  | 'subtitle'
  | 'link'
  | 'linkPrimary'
  | 'code';

type TextColor =
  | 'foreground'
  | 'muted'
  | 'surface'
  | 'surfaceForeground'
  | 'surfaceSecondary'
  | 'surfaceSecondaryForeground'
  | 'accent'
  | 'accentForeground'
  | 'danger'
  | 'dangerForeground'
  | 'link'
  | 'disabled';

type LegacyThemeColor =
  | 'text'
  | 'textSecondary'
  | 'background'
  | 'backgroundElement'
  | 'backgroundSelected';

export interface ThemedTextRef {
  setNativeProps(args: Record<string, unknown>): void;
}

export type ThemedTextProps = TextProps & {
  /**
   * MD3 typography role from the previous react-native-paper theme.
   */
  variant?: MD3TextVariant;
  /**
   * Backward-compatible aliases used by the Expo starter component.
   */
  type?: LegacyTextType;
  color?: TextColor;
  themeColor?: LegacyThemeColor;
  className?: string;
  children?: ReactNode;
  style?: StyleProp<TextStyle>;
};

const textVariantClassNames = {
  displayLarge: 'text-[57px] leading-[64px] tracking-[0px] font-normal',
  displayMedium: 'text-[45px] leading-[52px] tracking-[0px] font-normal',
  displaySmall: 'text-[36px] leading-[44px] tracking-[0px] font-normal',
  headlineLarge: 'text-[32px] leading-[40px] tracking-[0px] font-medium',
  headlineMedium: 'text-[28px] leading-[36px] tracking-[0px] font-semibold',
  headlineSmall: 'text-[24px] leading-[32px] tracking-[0px] font-bold',
  titleLarge: 'text-[22px] leading-[28px] tracking-[0px] font-medium',
  titleMedium: 'text-[16px] leading-[24px] tracking-[0.15px] font-semibold',
  titleSmall: 'text-[14px] leading-[20px] tracking-[0.1px] font-bold',
  labelLarge: 'text-[14px] leading-[20px] tracking-[0.1px] font-medium',
  labelMedium: 'text-[12px] leading-[16px] tracking-[0.5px] font-medium',
  labelSmall: 'text-[11px] leading-[16px] tracking-[0.5px] font-medium',
  bodyLarge: 'text-[16px] leading-[24px] tracking-[0px] font-normal',
  bodyMedium: 'text-[14px] leading-[20px] tracking-[0.25px] font-normal',
  bodySmall: 'text-[12px] leading-[16px] tracking-[0.4px] font-normal',
} as const satisfies Record<MD3TextVariant, string>;

const legacyTypeClassNames = {
  default: 'text-[16px] leading-[24px] font-medium',
  title: 'text-[48px] leading-[52px] font-semibold',
  small: 'text-[14px] leading-[20px] font-medium',
  smallBold: 'text-[14px] leading-[20px] font-bold',
  subtitle: 'text-[32px] leading-[44px] font-semibold',
  link: 'text-[14px] leading-[30px]',
  linkPrimary: 'text-[14px] leading-[30px] text-link',
  code: 'text-[12px] font-mono font-medium android:font-bold',
} as const satisfies Record<LegacyTextType, string>;

const textColorClassNames = {
  foreground: 'text-foreground',
  muted: 'text-muted',
  surface: 'text-surface',
  surfaceForeground: 'text-surface-foreground',
  surfaceSecondary: 'text-surface-secondary',
  surfaceSecondaryForeground: 'text-surface-secondary-foreground',
  accent: 'text-accent',
  accentForeground: 'text-accent-foreground',
  danger: 'text-danger',
  dangerForeground: 'text-danger-foreground',
  link: 'text-link',
  disabled: 'text-bridgefy-disabled',
} as const satisfies Record<TextColor, string>;

const legacyThemeColorClassNames = {
  text: textColorClassNames.foreground,
  textSecondary: textColorClassNames.muted,
  background: 'text-background',
  backgroundElement: textColorClassNames.surfaceSecondary,
  backgroundSelected: textColorClassNames.surfaceSecondary,
} as const satisfies Record<LegacyThemeColor, string>;

const getTypographyClassName = (variant?: MD3TextVariant, type?: LegacyTextType) => {
  if (variant) {
    return textVariantClassNames[variant];
  }

  return legacyTypeClassNames[type ?? 'default'];
};

const getColorClassName = (color?: TextColor, themeColor?: LegacyThemeColor) => {
  if (color) {
    return textColorClassNames[color];
  }

  if (themeColor) {
    return legacyThemeColorClassNames[themeColor];
  }

  return textColorClassNames.foreground;
};

const isThemedTextElement = (
  children: ReactNode,
): children is ReactElement<ComponentProps<typeof LegacyThemedText>> =>
  isValidElement<ComponentProps<typeof LegacyThemedText>>(children) &&
  children.type === LegacyThemedText;

const ThemedTextBase = (
  {
    children,
    className,
    color,
    style,
    themeColor,
    type = 'default',
    variant,
    ...props
  }: ThemedTextProps,
  ref: Ref<ThemedTextRef>,
) => {
  const root = useRef<Text | null>(null);
  const writingDirection = I18nManager.getConstants().isRTL ? 'rtl' : 'ltr';
  const nestedTextProps = isThemedTextElement(children) ? children.props : undefined;

  useImperativeHandle(ref, () => ({
    setNativeProps: args => root.current?.setNativeProps(args),
  }));

  return (
    <Text
      {...props}
      ref={root}
      className={cn(
        'text-left',
        getColorClassName(color, themeColor),
        getTypographyClassName(nestedTextProps?.variant ?? variant, nestedTextProps?.type ?? type),
        nestedTextProps &&
          !nestedTextProps.variant &&
          !nestedTextProps.type &&
          nestedTextProps.className,
        className,
      )}
      style={[{ writingDirection }, style]}
    >
      {children}
    </Text>
  );
};

/**
 * @deprecated Use `Text` from `heroui-native` instead.
 */
export const LegacyThemedText = forwardRef(ThemedTextBase);
