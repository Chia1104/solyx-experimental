import { memo, useMemo } from 'react';
import type { ComponentProps } from 'react';

import BigNumber from 'bignumber.js';
import { Text, cn } from 'heroui-native';
import { NumberValue } from 'heroui-native-pro/number-value';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { ThemedIcon } from '@/components/ui/themed-icon';
import type { EvmGasMode } from '@/modules/chain/utils/evm-gas-settings';

type IoniconName = ComponentProps<typeof ThemedIcon>['name'];

export const GAS_MODE_ICONS: Record<EvmGasMode, IoniconName> = {
  slow: 'walk-outline',
  average: 'bicycle-outline',
  fast: 'car-outline',
};

export const computeGasFiatValue = (gasFee: string, nativePrice?: string) => {
  if (!nativePrice || gasFee === '-' || gasFee === 'null') {
    return null;
  }

  const fee = new BigNumber(gasFee);
  if (!fee.isFinite()) {
    return null;
  }

  return fee.multipliedBy(nativePrice).toNumber();
};

interface GasFeeNativeDisplayProps {
  className?: string;
  gasFee: string;
  nativeSymbol: string;
}

export const GasFeeNativeDisplay = memo(
  ({ className, gasFee, nativeSymbol }: GasFeeNativeDisplayProps) => {
    return (
      <Text className={cn('text-foreground text-sm', className)} type="body">
        {`${gasFee} ${nativeSymbol}`}
      </Text>
    );
  },
);

interface GasFeeFiatDisplayProps {
  align?: 'end' | 'start';
  className?: string;
  fiatValue: number | null;
  locale: string;
  showApprox?: boolean;
}

export const GasFeeFiatDisplay = memo(
  ({ align = 'end', className, fiatValue, locale, showApprox = false }: GasFeeFiatDisplayProps) => {
    const textAlign = align === 'end' ? 'text-right' : 'text-left';

    if (fiatValue === null) {
      return <Text className={cn('text-default-foreground text-xs', textAlign, className)}>-</Text>;
    }

    return (
      <View
        className={cn(
          'flex-row items-center',
          align === 'end' ? 'justify-end' : 'justify-start',
          className,
        )}
      >
        {showApprox ? <Text className="text-default-foreground text-xs">≈ </Text> : null}
        <NumberValue
          classNames={{ value: cn('text-default-foreground text-xs', textAlign) }}
          currency="USD"
          locale={locale}
          maximumFractionDigits={2}
          numberStyle="currency"
          value={fiatValue}
        />
      </View>
    );
  },
);

interface GasFeeAmountDetailsProps {
  align?: 'end' | 'start';
  eta?: string;
  gasFee: string;
  gasModeLabel?: string;
  insufficientBalance?: boolean;
  locale: string;
  nativePrice?: string;
  nativeSymbol: string;
  showApproxFiat?: boolean;
  showUnavailable?: boolean;
}

export const GasFeeAmountDetails = memo(
  ({
    align = 'end',
    eta,
    gasFee,
    gasModeLabel,
    insufficientBalance = false,
    locale,
    nativePrice,
    nativeSymbol,
    showApproxFiat = false,
    showUnavailable = false,
  }: GasFeeAmountDetailsProps) => {
    const { t } = useTranslation(['defi']);
    const fiatValue = useMemo(
      () => computeGasFiatValue(gasFee, nativePrice),
      [gasFee, nativePrice],
    );
    const textAlign = align === 'end' ? 'text-right' : 'text-left';

    if (showUnavailable || gasFee === 'null') {
      return (
        <Text className={cn('text-foreground', textAlign)} type="body">
          {t('defi:label.unpredictable')}
        </Text>
      );
    }

    return (
      <View className={cn('gap-0.5', align === 'end' ? 'items-end' : 'items-start')}>
        {eta ? (
          <Text className={cn('text-foreground', textAlign)} type="body" weight="semibold">
            {eta}
          </Text>
        ) : null}
        {gasModeLabel ? (
          <Text className={cn('text-foreground', textAlign)} type="body">
            {gasModeLabel}
          </Text>
        ) : null}
        <GasFeeNativeDisplay
          className={cn(textAlign, !eta && !gasModeLabel && 'text-base')}
          gasFee={gasFee}
          nativeSymbol={nativeSymbol}
        />
        <GasFeeFiatDisplay
          align={align}
          fiatValue={fiatValue}
          locale={locale}
          showApprox={showApproxFiat}
        />
        {insufficientBalance ? (
          <Text className={cn('text-danger', textAlign)} type="body">
            {t('defi:error.amount.insufficient.balance')}
          </Text>
        ) : null}
      </View>
    );
  },
);

interface GasModeIconProps {
  mode: EvmGasMode;
  size?: number;
}

export const GasModeIcon = memo(({ mode, size = 18 }: GasModeIconProps) => {
  return (
    <View className="bg-content2 h-8 w-8 items-center justify-center rounded-full">
      <ThemedIcon className="text-foreground" name={GAS_MODE_ICONS[mode]} size={size} />
    </View>
  );
});
