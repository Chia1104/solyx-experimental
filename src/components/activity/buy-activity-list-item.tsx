import { memo } from 'react';

import BigNumber from 'bignumber.js';
import { Typography } from 'heroui-native';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import { ThemedIcon } from '@/components/ui/themed-icon';
import type { OnrampOrderListItem } from '@/modules/cefi/pipes/onramp.pipe';

interface BuyActivityListItemProps {
  data: OnrampOrderListItem;
  onPress: (orderId: string) => void;
}

export const BuyActivityListItem = memo(({ data, onPress }: BuyActivityListItemProps) => {
  const { t } = useTranslation(['defi']);
  const amountFormatted = new BigNumber(data.purchaseAmount || 0).decimalPlaces(8).toFormat();

  return (
    <Pressable className="px-3 py-4" onPress={() => onPress(data.id)}>
      <View className="flex-row items-center justify-between gap-3">
        <View className="min-w-0 flex-1 flex-row items-center gap-3">
          <View className="bg-accent/15 h-10 w-10 items-center justify-center rounded-full">
            <ThemedIcon className="text-accent" name="arrow-down-circle-outline" size={22} />
          </View>
          <Typography className="text-foreground" numberOfLines={1} weight="medium">
            {t('buy.orderDetail.listTitle', {
              symbol: data.purchaseCurrency || 'USDT',
            })}
          </Typography>
        </View>
        <Typography className="text-foreground shrink-0" weight="medium">
          +{amountFormatted} {data.purchaseCurrency || 'USDT'}
        </Typography>
      </View>
    </Pressable>
  );
});

BuyActivityListItem.displayName = 'BuyActivityListItem';
