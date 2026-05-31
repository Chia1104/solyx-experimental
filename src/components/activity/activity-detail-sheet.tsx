import { memo, useCallback, useMemo } from 'react';

import { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import BigNumber from 'bignumber.js';
import { BottomSheet, LinkButton, Typography } from 'heroui-native';
import { NumberValue } from 'heroui-native-pro/number-value';
import { useTranslation } from 'react-i18next';
import { Linking, View } from 'react-native';

import { ActivityDetailRow } from '@/components/activity/activity-detail-row';
import { ActivityRecordAmount } from '@/components/activity/activity-record-amount';
import {
  GasFeeFiatDisplay,
  computeGasFiatValue,
} from '@/components/defi/transaction-confirm/gas-fee-display';
import { AddressDisplay } from '@/components/ui/address-display';
import { CopyAction } from '@/components/ui/copy-action';
import type { ActionKey } from '@/modules/database/enums/defi-record.enum';
import type { DefiRecordRow } from '@/modules/database/schema/defi-record.schema';
import { useDefiAccount } from '@/modules/defi/hooks/use-defi-account';
import { useQueryPrices } from '@/modules/defi/hooks/use-query-prices';
import type { PriceItem } from '@/modules/defi/pipes/meta.pipe';
import {
  buildTransactionExplorerUrl,
  formatActivityDetailAddress,
  formatActivityRecordTimestamp,
  getActivityActionLabel,
  getActivityRecordStatusLabel,
  parseActivityRecordAmount,
  parseActivityRecordGasFee,
} from '@/modules/defi/utils/activity-transaction.utils';

interface ActivityDetailSheetProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  record: DefiRecordRow | null;
}

const ActivityDetailSheetContent = memo(({ record }: { record: DefiRecordRow }) => {
  const { i18n, t } = useTranslation(['defi', 'global']);
  const { chain, chainType, currentAddress, isEVM, wallet } = useDefiAccount();
  const pricesQuery = useQueryPrices();

  const actionKey = (record.functionName as ActionKey) || 'contractCall';
  const walletName = wallet?.name;

  const gasFee = useMemo(
    () => parseActivityRecordGasFee({ chain, chainType, record }),
    [chain, chainType, record],
  );

  const priceBySymbol = useMemo(
    () =>
      new Map<string, string>(
        (pricesQuery.data?.prices ?? []).map((item: PriceItem) => [
          item.symbol.toUpperCase(),
          item.price,
        ]),
      ),
    [pricesQuery.data?.prices],
  );

  const recordAmount = useMemo(() => parseActivityRecordAmount({ chain, record }), [chain, record]);

  const tokenPrice = useMemo(() => {
    const symbol = record.tokenSymbol;
    if (!symbol) {
      return undefined;
    }

    if (symbol === 'USDT' || symbol === 'USDC') {
      return '1';
    }

    const priceKey = symbol === 'L-BTC' || symbol === 'LBTC' ? 'BTC-USDT' : `${symbol}-USDT`;

    return priceBySymbol.get(priceKey.toUpperCase());
  }, [priceBySymbol, record.tokenSymbol]);

  const recordFiatValue = useMemo(() => {
    if (!tokenPrice) {
      return null;
    }

    const price = new BigNumber(tokenPrice);
    if (!price.isFinite()) {
      return null;
    }

    return new BigNumber(recordAmount.numericValue).multipliedBy(price).toNumber();
  }, [recordAmount.numericValue, tokenPrice]);

  const nativePrice = useMemo(() => {
    if (!chain) {
      return undefined;
    }

    const symbol = chain.nativeCurrency.symbol;
    if (symbol === 'USDT' || symbol === 'USDC') {
      return '1';
    }

    const priceKey = symbol === 'L-BTC' ? 'BTC-USDT' : `${symbol}-USDT`;

    return priceBySymbol.get(priceKey.toUpperCase());
  }, [chain, priceBySymbol]);

  const gasFiatValue = useMemo(
    () => computeGasFiatValue(String(gasFee), nativePrice),
    [gasFee, nativePrice],
  );

  const explorerUrl = useMemo(
    () => buildTransactionExplorerUrl({ chain, chainType, record }),
    [chain, chainType, record],
  );

  const onOpenExplorer = useCallback(() => {
    if (!explorerUrl) {
      return;
    }

    void Linking.openURL(explorerUrl);
  }, [explorerUrl]);

  return (
    <BottomSheetScrollView
      contentContainerClassName="gap-8 px-6 pb-10 pt-2"
      showsVerticalScrollIndicator={false}
    >
      <View className="items-center gap-2">
        <BottomSheet.Title className="text-center font-semibold">
          {getActivityActionLabel(actionKey, t)}
        </BottomSheet.Title>
        <ActivityRecordAmount
          actionKey={actionKey}
          chain={chain}
          classNames={{
            container: 'flex-row items-end justify-center',
            prefix: 'text-foreground text-3xl font-semibold',
            suffix: 'text-foreground mb-1 ml-1 text-base font-semibold',
            value: 'text-foreground text-3xl font-semibold',
          }}
          record={record}
        />
        {recordFiatValue !== null ? (
          <NumberValue
            classNames={{ value: 'text-default-foreground text-sm' }}
            currency="USD"
            locale={i18n.language}
            maximumFractionDigits={2}
            numberStyle="currency"
            value={recordFiatValue}
          />
        ) : null}
      </View>

      <View className="gap-4">
        <ActivityDetailRow label={t('label.transaction.status')}>
          <Typography className="text-foreground text-right" type="body-sm">
            {getActivityRecordStatusLabel(record, t)}
          </Typography>
        </ActivityDetailRow>

        <ActivityDetailRow label={t('global:unit.date')}>
          <Typography className="text-foreground text-right" type="body-sm">
            {formatActivityRecordTimestamp(record.timeStamp)}
          </Typography>
        </ActivityDetailRow>

        <ActivityDetailRow label={t('label.to')}>
          <View className="flex-row items-center gap-1">
            <Typography className="text-foreground text-right" numberOfLines={2} type="body-sm">
              {formatActivityDetailAddress({
                address: record.toAddress,
                userAddress: currentAddress,
                walletName,
              })}
            </Typography>
            {record.toAddress.toLowerCase() !== currentAddress.toLowerCase() ? (
              <CopyAction
                value={record.toAddress}
                iconProps={{
                  size: 16,
                }}
                buttonProps={{
                  className: 'size-7',
                }}
              />
            ) : null}
          </View>
        </ActivityDetailRow>

        <ActivityDetailRow label={t('label.from')}>
          <View className="flex-row items-center gap-1">
            <Typography className="text-foreground text-right" numberOfLines={2} type="body-sm">
              {formatActivityDetailAddress({
                address: record.fromAddress,
                userAddress: currentAddress,
                walletName,
              })}
            </Typography>
            {record.fromAddress.toLowerCase() !== currentAddress.toLowerCase() ? (
              <CopyAction
                value={record.fromAddress}
                iconProps={{
                  size: 16,
                }}
                buttonProps={{
                  className: 'size-7',
                }}
              />
            ) : null}
          </View>
        </ActivityDetailRow>

        <ActivityDetailRow label="TxID">
          <View className="flex-row items-center gap-1">
            <AddressDisplay address={record.hash} className="text-right" variant="compact" />
            <CopyAction
              value={record.hash}
              iconProps={{
                size: 16,
              }}
              buttonProps={{
                className: 'size-7',
              }}
            />
          </View>
        </ActivityDetailRow>

        <ActivityDetailRow label={t('label.network')}>
          <Typography className="text-foreground text-right" type="body-sm">
            {chain?.name ?? '-'}
          </Typography>
        </ActivityDetailRow>

        {isEVM ? (
          <ActivityDetailRow label="Nonce">
            <Typography className="text-foreground text-right" type="body-sm">
              {record.nonce ? `#${record.nonce}` : '-'}
            </Typography>
          </ActivityDetailRow>
        ) : null}
      </View>

      <View className="bg-surface-secondary flex-row items-center justify-between rounded-xl p-3">
        <Typography className="text-default-foreground" type="body-sm">
          {t('label.gas.fee')}
        </Typography>
        <View className="items-end gap-0.5">
          <NumberValue
            classNames={{ value: 'text-foreground text-sm' }}
            locale={i18n.language}
            maximumFractionDigits={8}
            value={gasFee}
          >
            <NumberValue.Value />
            <NumberValue.Suffix className="text-foreground ml-1 text-sm">
              {chain?.nativeCurrency.symbol}
            </NumberValue.Suffix>
          </NumberValue>
          <GasFeeFiatDisplay fiatValue={gasFiatValue} locale={i18n.language} />
        </View>
      </View>

      {explorerUrl ? (
        <LinkButton className="self-center" onPress={onOpenExplorer} size="sm">
          <LinkButton.Label className="text-accent text-sm">
            {t('global:description.check.on.scanner', {
              scanner: chain?.blockExplorers.default.name,
            })}
          </LinkButton.Label>
        </LinkButton>
      ) : null}
    </BottomSheetScrollView>
  );
});

ActivityDetailSheetContent.displayName = 'ActivityDetailSheetContent';

export const ActivityDetailSheet = memo(
  ({ isOpen, onOpenChange, record }: ActivityDetailSheetProps) => {
    return (
      <BottomSheet isOpen={isOpen} onOpenChange={onOpenChange}>
        <BottomSheet.Portal>
          <BottomSheet.Overlay className="bg-background/50" />
          <BottomSheet.Content
            contentContainerClassName="h-full"
            enableDynamicSizing={false}
            enableOverDrag={false}
            snapPoints={['72%']}
          >
            {record ? <ActivityDetailSheetContent record={record} /> : null}
          </BottomSheet.Content>
        </BottomSheet.Portal>
      </BottomSheet>
    );
  },
);

ActivityDetailSheet.displayName = 'ActivityDetailSheet';
