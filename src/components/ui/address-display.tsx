import type { ComponentProps } from 'react';

import { Typography, cn } from 'heroui-native';
import { Text, View } from 'react-native';

import {
  ADDRESS_COMPACT_PRESETS,
  ADDRESS_SPLIT_PRESETS,
  compactAddress,
  splitAddressParts,
} from '@/modules/chain/utils/address-display';
import type {
  CompactAddressOptions,
  SplitAddressOptions,
} from '@/modules/chain/utils/address-display';

type TypographyType = ComponentProps<typeof Typography>['type'];

export type AddressDisplayVariant = 'highlighted' | 'compact';

export type AddressCompactPreset = keyof typeof ADDRESS_COMPACT_PRESETS;

export type AddressSplitPreset = keyof typeof ADDRESS_SPLIT_PRESETS;

interface AddressDisplayProps {
  address: string;
  className?: string;
  compactOptions?: CompactAddressOptions;
  compactPreset?: AddressCompactPreset;
  selectable?: boolean;
  splitOptions?: SplitAddressOptions;
  splitPreset?: AddressSplitPreset;
  type?: TypographyType;
  variant: AddressDisplayVariant;
}

const resolveSplitOptions = (
  preset: AddressSplitPreset | undefined,
  options: SplitAddressOptions | undefined,
) => ({
  ...(preset ? ADDRESS_SPLIT_PRESETS[preset] : ADDRESS_SPLIT_PRESETS.default),
  ...options,
});

const resolveCompactOptions = (
  preset: AddressCompactPreset | undefined,
  options: CompactAddressOptions | undefined,
) => ({
  ...(preset ? ADDRESS_COMPACT_PRESETS[preset] : ADDRESS_COMPACT_PRESETS.default),
  ...options,
});

export const AddressDisplay = ({
  address,
  className,
  compactOptions,
  compactPreset,
  selectable,
  splitOptions,
  splitPreset,
  type = 'body-sm',
  variant,
}: AddressDisplayProps) => {
  if (!address) {
    return null;
  }

  if (variant === 'compact') {
    return (
      <Typography
        className={cn('text-foreground min-w-0', className)}
        ellipsizeMode="middle"
        numberOfLines={1}
        selectable={selectable}
        type={type}
      >
        {compactAddress(address, resolveCompactOptions(compactPreset, compactOptions))}
      </Typography>
    );
  }

  const { head, middle, tail } = splitAddressParts(
    address,
    resolveSplitOptions(splitPreset, splitOptions),
  );

  return (
    <View className={cn('min-w-0 flex-1', className)}>
      <Typography className="text-foreground break-all" selectable={selectable} type={type}>
        <Text className="text-accent">{head}</Text>
        {middle}
        <Text className="text-accent">{tail}</Text>
      </Typography>
    </View>
  );
};
