import { Popover, Typography } from 'heroui-native';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { ChainMark } from '@/components/home/chain-mark';
import { AddressDisplay } from '@/components/ui/address-display';
import { ThemedIcon } from '@/components/ui/themed-icon';
import type { ChainConfig } from '@/modules/chain/stores/chain-adapter/types';

interface BuyReceivingInfoProps {
  accountName: string;
  chain?: ChainConfig;
  displayAddress: string;
}

export const BuyReceivingInfo = ({ accountName, chain, displayAddress }: BuyReceivingInfoProps) => {
  const { t } = useTranslation(['defi']);

  return (
    <>
      <Typography className="text-muted mt-1" type="body-sm">
        {t('buyModal.receivingInformation')}
      </Typography>

      <View className="bg-background gap-3 rounded-xl p-4">
        <View className="flex-row items-center gap-2">
          <ThemedIcon className="text-muted" name="wallet-outline" size={20} />
          <Typography className="text-muted">{accountName}</Typography>
        </View>

        <View className="flex-row items-center gap-2">
          {chain ? <ChainMark chain={chain} type="chain" /> : null}
          <Typography className="text-foreground">{chain?.name ?? '—'}</Typography>
          <Popover>
            <Popover.Trigger className="p-1">
              <ThemedIcon className="text-muted" name="information-circle-outline" size={16} />
            </Popover.Trigger>
            <Popover.Portal>
              <Popover.Overlay />
              <Popover.Content placement="top" presentation="popover" width={280}>
                <Popover.Description className="text-foreground">
                  {t('buyModal.ethereumOnlyTooltip')}
                </Popover.Description>
              </Popover.Content>
            </Popover.Portal>
          </Popover>
        </View>

        <AddressDisplay address={displayAddress} className="w-full" variant="highlighted" />
      </View>
    </>
  );
};
