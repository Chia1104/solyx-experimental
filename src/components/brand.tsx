import { cn } from 'heroui-native';
import type { ViewProps } from 'react-native';
import { View } from 'react-native';
import type { SvgProps } from 'react-native-svg';
import Svg, { Defs, G, LinearGradient, Mask, Path, Rect, Stop } from 'react-native-svg';

import LogoVerticalBlack from './icons/logo-vertical';

interface BrandProps extends ViewProps {
  display?: ('brand' | 'background')[];
  wrapperProps?: ViewProps;
}

export const Background = ({
  className,
  preserveAspectRatio = 'xMaxYMax slice',
  ...props
}: SvgProps) => {
  return (
    <View className="absolute inset-0 z-0" pointerEvents="none">
      <Svg
        width="100%"
        height="100%"
        viewBox="-100 0 500 812"
        preserveAspectRatio={preserveAspectRatio}
        className={cn('h-full w-full', className)}
        {...props}
        pointerEvents="none"
      >
        <G mask="url(#background_fade_mask)">
          <Path
            d="M463.65 355C301.116 355 50.3246 456.977 -124.252 643.357C-169.968 692.164 -212.227 748.142 -247 812H-104.563C-31.518 689.252 119.848 562.859 119.848 562.859C119.848 562.859 -9.37169 725.716 -46.4304 812H138.158C138.158 812 238.097 513.333 621 355H463.65Z"
            fill="black"
            fillOpacity="0.05"
          />
          <Path
            d="M-89.6498 457C72.8839 457 323.676 355.023 498.252 168.643C543.968 119.836 586.228 63.8581 621 6.10352e-05L478.563 4.85829e-05C405.518 122.748 254.152 249.141 254.152 249.141C254.152 249.141 383.372 86.2841 420.431 4.35008e-05L235.842 2.73636e-05C235.842 2.73636e-05 135.903 298.667 -247 457L-89.6498 457Z"
            fill="black"
            fillOpacity="0.05"
          />
        </G>
        <Defs>
          <LinearGradient
            id="background_fade_gradient"
            x1="0"
            y1="0"
            x2="0"
            y2="812"
            gradientUnits="userSpaceOnUse"
          >
            <Stop offset="0" stopColor="white" stopOpacity="0" />
            <Stop offset="0.18" stopColor="white" stopOpacity="1" />
            <Stop offset="0.82" stopColor="white" stopOpacity="1" />
            <Stop offset="1" stopColor="white" stopOpacity="0" />
          </LinearGradient>
          <Mask
            id="background_fade_mask"
            x="-100"
            y="0"
            width="500"
            height="812"
            maskUnits="userSpaceOnUse"
          >
            <Rect x="-100" y="0" width="500" height="812" fill="url(#background_fade_gradient)" />
          </Mask>
        </Defs>
      </Svg>
    </View>
  );
};

export const BrandImage = ({ className, ...props }: ViewProps) => {
  return (
    <View
      className={cn('w-full flex-1 items-center justify-center', className)}
      {...props}
      pointerEvents="none"
    >
      <LogoVerticalBlack />
    </View>
  );
};

const Brand = ({
  children,
  className,
  display = ['brand', 'background'],
  wrapperProps,
  ...props
}: BrandProps) => {
  return (
    <View
      className={cn(
        'bg-background relative flex-1 overflow-hidden',
        display.includes('brand') && 'items-center justify-center',
        className,
      )}
      {...props}
    >
      {display.includes('background') && <Background />}
      <View className={cn('absolute inset-0 z-20', wrapperProps?.className)} {...wrapperProps}>
        {display.includes('brand') && <BrandImage />}
        {children}
      </View>
    </View>
  );
};

export default Brand;
