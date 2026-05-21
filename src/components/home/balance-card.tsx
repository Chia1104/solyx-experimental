import type BigNumber from 'bignumber.js';
import { Popover, Skeleton, Text } from 'heroui-native';
import { NumberValue } from 'heroui-native-pro/number-value';
import { useTranslation } from 'react-i18next';
import { ImageBackground, Pressable } from 'react-native';

import { ThemedIcon } from '@/components/ui/themed-icon';
import type { ChainConfig } from '@/modules/chain/stores/chain-adapter/types';
import { ChainType } from '@/modules/chain/stores/chain-adapter/types';

const heroBackground = require('@/assets/images/home/bridgefu-hero-background.png');

interface BalanceCardProps {
  chain?: ChainConfig;
  isBalanceVisible: boolean;
  isLoading: boolean;
  totalFiatValue: BigNumber;
  onToggleVisibility: () => void;
}

export const BalanceCard = ({
  chain,
  isBalanceVisible,
  isLoading,
  totalFiatValue,
  onToggleVisibility,
}: BalanceCardProps) => {
  const { i18n } = useTranslation(['defi']);

  return (
    <ImageBackground
      className="bg-accent min-h-[154px] overflow-hidden rounded-xl px-4 pt-5 pb-7"
      imageStyle={{ opacity: 0.78, transform: [{ translateX: 84 }] }}
      resizeMode="cover"
      source={heroBackground}
    >
      <BalanceModePopover chain={chain} />

      <Pressable className="mt-4 flex-row items-center gap-2" onPress={onToggleVisibility}>
        {isBalanceVisible ? (
          isLoading ? (
            <Skeleton className="bg-accent-foreground/20 h-12 w-52 rounded-xl" />
          ) : (
            <NumberValue
              classNames={{
                value: 'text-accent-foreground text-[40px] font-bold tracking-[1.2px]',
              }}
              currency="USD"
              locale={i18n.language}
              maximumFractionDigits={2}
              numberStyle="currency"
              value={totalFiatValue.toNumber()}
            />
          )
        ) : (
          <Text className="text-accent-foreground text-[40px] tracking-[1.2px]" weight="bold">
            ******
          </Text>
        )}
        <ThemedIcon
          className="text-accent-foreground"
          name={isBalanceVisible ? 'eye-outline' : 'eye-off-outline'}
          size={24}
        />
      </Pressable>
    </ImageBackground>
  );
};

interface BalanceModePopoverProps {
  chain?: ChainConfig;
}

const BalanceModePopover = ({ chain }: BalanceModePopoverProps) => {
  const { t } = useTranslation(['defi']);
  const isPrivateChain = chain?.chainType === ChainType.LIQUID;
  const label = isPrivateChain ? t('caption.confidential.secured') : t('caption.public.explorer');
  const description = isPrivateChain
    ? t('caption.tooltip.confidentialSecured')
    : t('caption.tooltip.publicExplorer');

  return (
    <Popover>
      <Popover.Trigger className="border-accent-foreground/20 bg-accent-foreground/15 flex-row items-center gap-1 self-start rounded-xl border px-3 py-1.5">
        <Text className="text-accent-foreground text-xs">{label}</Text>
        <ThemedIcon
          className="text-accent-foreground"
          name="information-circle-outline"
          size={14}
        />
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Overlay />
        <Popover.Content align="start" placement="bottom" presentation="popover" width={280}>
          <Popover.Arrow />
          <Popover.Description className="text-foreground">{description}</Popover.Description>
        </Popover.Content>
      </Popover.Portal>
    </Popover>
  );
};
