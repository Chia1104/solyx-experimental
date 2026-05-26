import { useState } from 'react';

import { useRouter } from 'expo-router';
import { Button, Select, Text } from 'heroui-native';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { useLiquidSession } from '@/modules/chain/hooks/use-liquid-session';
import type { ChainConfig } from '@/modules/chain/stores/chain-adapter/types';
import { useUserStore } from '@/modules/user/stores/user';

import type { AssetRow } from './asset-list';
import { AssetList } from './asset-list';
import { ChainMark } from './chain-mark';
import { getModeChains, getNetworkMode } from './home-chain-utils';

interface AssetsPanelProps {
  chain?: ChainConfig;
  isBalanceVisible: boolean;
  isLoading: boolean;
  rows: AssetRow[];
  statusText: string;
}

export const AssetsPanel = ({
  chain,
  isBalanceVisible,
  isLoading,
  rows,
  statusText,
}: AssetsPanelProps) => {
  const router = useRouter();
  const { t } = useTranslation(['defi']);

  return (
    <View className="gap-3">
      <View className="flex-row items-center justify-between">
        <Text className="text-foreground" type="h5">
          {t('caption.home.my.assets')}
        </Text>
        <ChainSelector chain={chain} />
      </View>

      <View className="gap-3">
        {rows.length > 0 ? (
          <AssetList
            isBalanceVisible={isBalanceVisible}
            isLoading={isLoading}
            onPressAsset={row => router.push(`/assets/${row.symbol}`)}
            rows={rows}
          />
        ) : (
          <View className="bg-content1 rounded-3xl p-5">
            <Text className="text-foreground/60">{statusText}</Text>
          </View>
        )}
      </View>
    </View>
  );
};

interface ChainSelectorProps {
  chain?: ChainConfig;
}

const ChainSelector = ({ chain }: ChainSelectorProps) => {
  const { t } = useTranslation(['defi']);
  const [isOpen, setIsOpen] = useState(false);
  const [pendingChainId, setPendingChainId] = useState<number | null>(null);
  const currentWalletId = useUserStore(state => state.wallet.currentWalletId);
  const wallets = useUserStore(state => state.wallet.wallets);
  const changeNetwork = useUserStore(state => state.changeNetwork);
  const { ensureLiquidSession } = useLiquidSession();
  const mode = getNetworkMode(chain?.chainType);
  const options = getModeChains(
    mode,
    wallets.find(wallet => wallet.id === currentWalletId)?.chains,
  );

  const handleSelectChain = async (chainId: number) => {
    if (chainId === chain?.chainId || pendingChainId) {
      return;
    }

    setPendingChainId(chainId);
    try {
      const isLiquidSessionReady = await ensureLiquidSession(chainId);
      if (!isLiquidSessionReady) {
        return;
      }
      changeNetwork(chainId);
      setIsOpen(false);
    } catch {
      // Keep the current chain when the Liquid unlock request is dismissed or fails.
    } finally {
      setPendingChainId(null);
    }
  };

  if (options.length <= 1) {
    return <ChainSelectorButton chain={chain} label={t('caption.home.no.network')} />;
  }

  return (
    <Select
      presentation="bottom-sheet"
      value={{
        label: chain?.name ?? t('caption.home.no.network'),
        value: chain?.chainId?.toString() ?? '',
      }}
      onValueChange={option => handleSelectChain(Number(option?.value))}
      isOpen={isOpen}
      onOpenChange={setIsOpen}
    >
      <Select.Trigger className="h-auto min-h-0 px-2 py-1">
        <ChainMark chain={chain} />
        <Text className="text-foreground" type="body-sm">
          {chain?.name ?? t('caption.home.no.network')}
        </Text>
        <Select.TriggerIndicator />
      </Select.Trigger>
      <Select.Portal>
        <Select.Overlay className="bg-background/50" />
        <Select.Content presentation="bottom-sheet" snapPoints={['35%']}>
          {options.map(option => (
            <Select.Item
              key={option.chainId}
              value={option.chainId.toString()}
              label={option.name}
            />
          ))}
        </Select.Content>
      </Select.Portal>
    </Select>
  );
};

interface ChainSelectorButtonProps {
  chain?: ChainConfig;
  isExpandable?: boolean;
  label: string;
}

const ChainSelectorButton = ({
  chain,
  isExpandable = false,
  label,
  ...props
}: ChainSelectorButtonProps) => (
  <Button
    className="bg-surface h-auto min-h-0 self-start rounded-lg px-2.5 py-1.5"
    size="sm"
    variant="ghost"
    {...props}
  >
    <ChainMark chain={chain} />
    <Button.Label className="text-foreground">{chain?.name ?? label}</Button.Label>
    {isExpandable && <Select.TriggerIndicator />}
  </Button>
);
