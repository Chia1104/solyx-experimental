import { memo } from 'react';

import { Typography } from 'heroui-native';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { AddressDisplay } from '@/components/ui/address-display';
import { CopyAction } from '@/components/ui/copy-action';
import type { ChainType } from '@/modules/chain/stores/chain-adapter/types';
import type { TransactionConfirmParams } from '@/modules/chain/utils/transaction-confirm';
import { useDefiAccount } from '@/modules/defi/hooks/use-defi-account';

import { useTransactionConfirmData } from './use-transaction-confirm-data';

interface TransactionDetailsProps {
  chainId?: number | string;
  chainType: ChainType;
  isInModal?: boolean;
  sendParams: TransactionConfirmParams;
}

export const TransactionDetails = memo(
  ({ chainId, chainType, isInModal, sendParams }: TransactionDetailsProps) => {
    const { t } = useTranslation(['defi', 'global']);
    const { wallet } = useDefiAccount();
    const { effectiveAddress, effectiveChain, formattedToAddress, toAddress } =
      useTransactionConfirmData({ chainId, chainType, sendParams });
    const accountName = wallet?.name ?? t('defi:label.setting.current.account');

    return (
      <View className="mt-12 mb-9 gap-4">
        {isInModal ? (
          <View className="flex-row items-center justify-between">
            <Typography className="text-foreground" type="body-sm">
              {t('defi:title.dapp')}
            </Typography>
            <View className="bg-content2 h-6 w-6 rounded-full" />
          </View>
        ) : null}

        <View className="flex-row items-start justify-between gap-3">
          <Typography className="text-default-foreground shrink-0" type="body-sm">
            {t('defi:label.to')}
          </Typography>
          <View className="max-w-[65%] flex-row items-center gap-1">
            {formattedToAddress ? (
              <AddressDisplay
                address={toAddress}
                className="shrink text-right"
                compactPreset="liquid"
                type="body-sm"
                variant="compact"
              />
            ) : (
              <AddressDisplay
                address={toAddress}
                className="shrink justify-end"
                type="body-sm"
                variant="highlighted"
              />
            )}
            <CopyAction value={toAddress} />
          </View>
        </View>

        <View className="flex-row items-center justify-between gap-3">
          <Typography className="text-default-foreground" type="body-sm">
            {t('defi:label.from')}
          </Typography>
          <View className="max-w-[65%] flex-row flex-wrap items-center justify-end gap-0.5">
            <Typography className="text-foreground text-right" type="body-sm">
              {accountName} (
            </Typography>
            <AddressDisplay address={effectiveAddress} type="body-sm" variant="compact" />
            <Typography className="text-foreground text-right" type="body-sm">
              )
            </Typography>
          </View>
        </View>

        <View className="flex-row items-center justify-between gap-3">
          <Typography className="text-default-foreground" type="body-sm">
            {t('defi:label.network')}
          </Typography>
          <Typography className="text-foreground text-right" type="body-sm">
            {effectiveChain?.name}
          </Typography>
        </View>
      </View>
    );
  },
);
