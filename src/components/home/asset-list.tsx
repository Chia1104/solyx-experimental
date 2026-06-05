import type BigNumber from 'bignumber.js';
import { Skeleton, Typography } from 'heroui-native';
import { NumberValue } from 'heroui-native-pro/number-value';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import { AssetGuard } from '@/components/asset-guard';
import type { SupportedCurrencySymbol } from '@/modules/chain/enums/supported-currency-symbol.enum';

import { TokenMark } from './chain-mark';

export interface AssetRow {
  address: string;
  balance: string;
  fiatValue: BigNumber;
  name: string;
  price: string;
  symbol: SupportedCurrencySymbol;
}

interface AssetListProps {
  isLoading?: boolean;
  onPressAsset?: (row: AssetRow) => void;
  rows: AssetRow[];
}

export const AssetList = ({ isLoading = false, onPressAsset, rows }: AssetListProps) => {
  return (
    <View className="gap-3">
      {rows.map(row => (
        <AssetListItem
          isLoading={isLoading}
          key={`${row.symbol}:${row.address}`}
          onPress={() => onPressAsset?.(row)}
          row={row}
        />
      ))}
    </View>
  );
};

interface AssetListItemProps {
  isLoading: boolean;
  onPress: () => void;
  row: AssetRow;
}

const AssetListItem = ({ isLoading, onPress, row }: AssetListItemProps) => {
  const { i18n } = useTranslation();

  return (
    <Pressable className="bg-surface justify-center rounded-2xl px-4 py-3" onPress={onPress}>
      <View className="flex-row items-center justify-between gap-3">
        <View className="min-w-0 flex-1 flex-row items-center gap-3">
          <TokenMark symbol={row.symbol} network="" size="lg" />
          <View className="min-w-0 flex-1">
            <Typography className="text-foreground" numberOfLines={1} weight="medium">
              {row.symbol}
            </Typography>
            <AssetGuard className="text-foreground/50" numberOfLines={1} type="body-xs">
              <NumberValue
                classNames={{ value: 'text-foreground/50' }}
                currency="USD"
                locale={i18n.language}
                maximumFractionDigits={2}
                numberStyle="currency"
                value={row.fiatValue.toNumber()}
              />
            </AssetGuard>
          </View>
        </View>

        <View className="items-end">
          <AssetGuard className="text-foreground" type="h5" weight="medium">
            {isLoading ? (
              <Skeleton className="h-5 w-20 rounded-md" />
            ) : (
              <NumberValue
                classNames={{ value: 'text-foreground font-medium text-lg' }}
                locale={i18n.language}
                maximumFractionDigits={8}
                value={Number(row.balance)}
              />
            )}
          </AssetGuard>
        </View>
      </View>
    </Pressable>
  );
};

export const AssetListSkeleton = () => (
  <View className="gap-3">
    {Array.from({ length: 3 }).map((_, index) => (
      <View
        className="bg-surface flex-row items-center justify-between rounded-xl px-4 py-3"
        key={index}
      >
        <View className="flex-row items-center gap-3">
          <Skeleton className="h-[30px] w-[30px] rounded-full" />
          <View className="gap-2">
            <Skeleton className="h-5 w-16 rounded-md" />
            <Skeleton className="h-4 w-20 rounded-md" />
          </View>
        </View>
        <Skeleton className="h-5 w-20 rounded-md" />
      </View>
    ))}
  </View>
);
