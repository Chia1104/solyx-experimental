import { Skeleton, Typography } from 'heroui-native';
import { NumberValue } from 'heroui-native-pro/number-value';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { AssetGuard } from '@/components/asset-guard';
import { TokenMark } from '@/components/home/chain-mark';
import type { SupportedCurrencySymbol } from '@/modules/chain/enums/supported-currency-symbol.enum';

interface AssetBalanceSectionProps {
  balance: string;
  fiatValue: number;
  isLoading: boolean;
  symbol: SupportedCurrencySymbol | string;
}

export const AssetBalanceSection = ({
  balance,
  fiatValue,
  isLoading,
  symbol,
}: AssetBalanceSectionProps) => {
  const { i18n } = useTranslation(['defi']);

  return (
    <View className="w-full items-center gap-2 py-8">
      <TokenMark network="" size="lg" symbol={symbol as SupportedCurrencySymbol} />

      {isLoading ? (
        <View className="items-center gap-2">
          <View className="flex-row items-center gap-1">
            <Skeleton className="h-10 w-32 rounded-lg" />
            <Skeleton className="h-5 w-12 rounded-md" />
          </View>
          <Skeleton className="h-4 w-20 rounded-md" />
        </View>
      ) : (
        <>
          <View className="flex-row items-center gap-1">
            <AssetGuard className="text-foreground" type="h1" weight="medium">
              <NumberValue
                classNames={{ value: 'text-foreground text-[36px] font-medium leading-none' }}
                locale={i18n.language}
                maximumFractionDigits={8}
                value={Number(balance)}
              />
            </AssetGuard>
            <Typography className="text-foreground leading-none" type="body-sm">
              {symbol}
            </Typography>
          </View>
          <AssetGuard className="text-foreground/50 leading-none" type="body-sm">
            <NumberValue
              classNames={{ value: 'text-foreground/50' }}
              currency="USD"
              locale={i18n.language}
              maximumFractionDigits={2}
              numberStyle="currency"
              value={fiatValue}
            />
          </AssetGuard>
        </>
      )}
    </View>
  );
};
