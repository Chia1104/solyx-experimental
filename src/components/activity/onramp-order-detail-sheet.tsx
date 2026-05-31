import { memo, useCallback, useMemo, useState } from 'react';

import { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import BigNumber from 'bignumber.js';
import dayjs from 'dayjs';
import { BottomSheet, Button, LinkButton, Popover, Spinner, Typography } from 'heroui-native';
import { NumberValue } from 'heroui-native-pro/number-value';
import type { TFunction } from 'i18next';
import { useTranslation } from 'react-i18next';
import { Linking, View } from 'react-native';

import { ActivityDetailRow } from '@/components/activity/activity-detail-row';
import { TokenMark } from '@/components/home/chain-mark';
import { AddressDisplay } from '@/components/ui/address-display';
import { CopyAction } from '@/components/ui/copy-action';
import { ThemedIcon } from '@/components/ui/themed-icon';
import { useQueryOnrampOrder } from '@/modules/cefi/hooks/use-query-onramp-order';
import { SupportedNetwork } from '@/modules/chain/enums/supported-chain.enum';
import type { SupportedCurrencySymbol } from '@/modules/chain/enums/supported-currency-symbol.enum';
import { EIP155_CHAINS } from '@/modules/chain/stores/chain-adapter/chains';
import { useQueryPrices } from '@/modules/defi/hooks/use-query-prices';
import type { PriceItem } from '@/modules/defi/pipes/meta.pipe';

interface OnrampOrderDetailSheetProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  orderId: string | null;
}

const formatDate = (dateString: string) => {
  if (!dateString) {
    return '-';
  }

  return dayjs(dateString).format('h:mm A MMM D, YYYY');
};

const getExplorerTxUrl = (chainId: string, txId: string) => {
  const normalized = chainId.startsWith('eip155:') ? chainId.replace(/^eip155:/, '') : chainId;
  const evmChain = Object.values(EIP155_CHAINS).find(chain => String(chain.chainId) === normalized);
  const base = evmChain?.blockExplorers.default.url ?? 'https://etherscan.io';

  return `${base.replace(/\/$/, '')}/tx/${txId}`;
};

const getStatusLabel = (status: string, t: TFunction<['defi']>) => {
  const normalized = (status || '').toLowerCase();

  if (normalized === 'success' || normalized === 'completed') {
    return t('buy.orderDetail.statusSuccess');
  }

  if (normalized === 'new') {
    return t('buy.orderDetail.statusNew');
  }

  if (normalized.includes('progress') || normalized === 'processing') {
    return t('buy.orderDetail.statusInProgress');
  }

  return status || '-';
};

interface DetailInfoRowProps {
  label: string;
  tooltip?: string;
  value: string;
}

const DetailInfoRow = memo(({ label, tooltip, value }: DetailInfoRowProps) => (
  <ActivityDetailRow label={label}>
    <View className="flex-row items-center gap-1">
      {tooltip ? (
        <Popover>
          <Popover.Trigger className="mr-1 p-0.5">
            <ThemedIcon className="text-muted" name="information-circle-outline" size={14} />
          </Popover.Trigger>
          <Popover.Portal>
            <Popover.Overlay />
            <Popover.Content placement="top" presentation="popover" width={260}>
              <Popover.Description className="text-foreground">{tooltip}</Popover.Description>
            </Popover.Content>
          </Popover.Portal>
        </Popover>
      ) : null}
      <Typography className="text-foreground text-right" numberOfLines={2}>
        {value}
      </Typography>
    </View>
  </ActivityDetailRow>
));

DetailInfoRow.displayName = 'DetailInfoRow';

const OnrampOrderDetailContent = memo(({ orderId }: { orderId: string }) => {
  const { i18n, t } = useTranslation(['defi']);
  const [syncWithProvider] = useState(true);
  const pricesQuery = useQueryPrices();
  const orderQuery = useQueryOnrampOrder({ orderId, syncWithProvider });

  const detail = orderQuery.data;

  const usdValue = useMemo(() => {
    if (!detail?.purchaseCurrency || !detail.purchaseAmount) {
      return 0;
    }

    const symbol = detail.purchaseCurrency.toUpperCase();
    const priceItem = (pricesQuery.data?.prices ?? []).find((item: PriceItem) => {
      if (symbol === 'USDT' || symbol === 'USDC') {
        return item.symbol.toUpperCase() === `${symbol}-USDT` || item.symbol === symbol;
      }

      return item.symbol.toUpperCase() === `${symbol}-USDT`;
    });

    const price = priceItem?.price ?? (symbol === 'USDT' || symbol === 'USDC' ? '1' : '0');

    return new BigNumber(detail.purchaseAmount).multipliedBy(price).toNumber();
  }, [detail?.purchaseAmount, detail?.purchaseCurrency, pricesQuery.data?.prices]);

  const handleOpenTxExplorer = useCallback(() => {
    if (!detail?.txId || !detail.chainId) {
      return;
    }

    void Linking.openURL(getExplorerTxUrl(detail.chainId, detail.txId));
  }, [detail?.chainId, detail?.txId]);

  const handleContactSupport = useCallback(() => {
    void Linking.openURL('mailto:support@bridgefy.com');
  }, []);

  if (orderQuery.isLoading || !detail) {
    return (
      <View className="items-center justify-center py-16">
        <Spinner size="lg" />
      </View>
    );
  }

  if (orderQuery.isError) {
    return (
      <View className="items-center justify-center px-6 py-16">
        <Typography className="text-danger text-center">{t('error.unknown.error')}</Typography>
      </View>
    );
  }

  const amountFormatted = new BigNumber(detail.purchaseAmount || 0).decimalPlaces(8).toFormat();
  const purchaseSymbol = (detail.purchaseCurrency || 'USDT') as SupportedCurrencySymbol;

  return (
    <BottomSheetScrollView contentContainerStyle={{ padding: 20, paddingBottom: 32 }}>
      <View className="mb-6 flex-row items-center gap-3">
        <TokenMark symbol={purchaseSymbol} network={SupportedNetwork.Evm} size="lg" />
        <View>
          <Typography className="text-foreground" type="h3" weight="bold">
            +{amountFormatted} {detail.purchaseCurrency}
          </Typography>
          <NumberValue
            classNames={{ value: 'text-muted text-base' }}
            currency="USD"
            locale={i18n.language}
            maximumFractionDigits={2}
            numberStyle="currency"
            value={usdValue}
          />
        </View>
      </View>

      <View className="gap-3">
        <DetailInfoRow
          label={t('buy.orderDetail.status')}
          value={getStatusLabel(detail.status, t)}
        />
        <ActivityDetailRow label={t('buy.orderDetail.orderNo')}>
          <View className="flex-row items-center gap-1">
            <Typography className="text-foreground" numberOfLines={1}>
              {orderId}
            </Typography>
            <CopyAction value={orderId} />
          </View>
        </ActivityDetailRow>
        <DetailInfoRow
          label={t('buy.orderDetail.coinbaseFee')}
          tooltip={t('buy.orderDetail.tooltipCoinbaseFee')}
          value={`${detail.fees?.coinbase?.value ?? '0'} ${detail.fees?.coinbase?.currency ?? 'USD'}`}
        />
        <DetailInfoRow
          label={t('buy.orderDetail.networkFee')}
          tooltip={t('buy.orderDetail.tooltipNetworkFee')}
          value={`${detail.fees?.network?.value ?? '0'} ${detail.fees?.network?.currency ?? 'USD'}`}
        />
        <DetailInfoRow
          label={t('buy.orderDetail.paid')}
          value={`${detail.paymentAmount ?? '0'} ${detail.paymentCurrency ?? 'USD'}`}
        />
        <DetailInfoRow
          label={t('buy.orderDetail.created')}
          value={formatDate(detail.createdAt ?? '')}
        />
        <DetailInfoRow
          label={t('buy.orderDetail.updated')}
          value={formatDate(detail.updatedAt ?? '')}
        />
        {detail.txId ? (
          <View className="bg-background mt-2 gap-2 rounded-xl p-4">
            <Typography className="text-muted" type="body-sm">
              {t('buy.orderDetail.txid')}
            </Typography>
            <View className="flex-row items-center justify-between gap-2">
              <AddressDisplay address={detail.txId} className="min-w-0 flex-1" variant="compact" />
              <LinkButton onPress={handleOpenTxExplorer} size="sm">
                <ThemedIcon className="text-accent" name="open-outline" size={18} />
              </LinkButton>
            </View>
          </View>
        ) : null}
      </View>

      <Button className="mt-6" onPress={handleContactSupport} variant="primary">
        <Button.Label>{t('buy.orderDetail.contactSupport')}</Button.Label>
      </Button>
    </BottomSheetScrollView>
  );
});

OnrampOrderDetailContent.displayName = 'OnrampOrderDetailContent';

export const OnrampOrderDetailSheet = ({
  isOpen,
  onOpenChange,
  orderId,
}: OnrampOrderDetailSheetProps) => {
  const { t } = useTranslation(['defi']);

  return (
    <BottomSheet isOpen={isOpen} onOpenChange={onOpenChange}>
      <BottomSheet.Portal>
        <BottomSheet.Overlay className="bg-background/50" />
        <BottomSheet.Content snapPoints={['85%']}>
          <BottomSheet.Title className="text-center">
            {t('buy.orderDetail.title')}
          </BottomSheet.Title>
          {orderId ? <OnrampOrderDetailContent orderId={orderId} /> : null}
        </BottomSheet.Content>
      </BottomSheet.Portal>
    </BottomSheet>
  );
};
