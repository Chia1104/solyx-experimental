import { useState } from 'react';

import { useRouter } from 'expo-router';
import { Segment } from 'heroui-native-pro/segment';
import { useTranslation } from 'react-i18next';
import { Image, Pressable, View } from 'react-native';

import { ThemedIcon } from '@/components/ui/themed-icon';
import { useLiquidSession } from '@/modules/chain/hooks/use-liquid-session';
import type { ChainConfig } from '@/modules/chain/stores/chain-adapter/types';
import { useUserStore } from '@/modules/user/stores/user';
import type { WalletItem } from '@/modules/user/stores/user/types';

import { getNetworkMode, PRIVATE_CHAIN_ID, PUBLIC_CHAIN_ID } from './home-chain-utils';
import type { NetworkMode } from './home-chain-utils';

interface HomeTopBarProps {
  chain?: ChainConfig;
  wallet?: WalletItem;
}

export const HomeTopBar = ({ chain, wallet }: HomeTopBarProps) => {
  const router = useRouter();
  const { t } = useTranslation(['defi']);
  const [pendingMode, setPendingMode] = useState<NetworkMode | null>(null);
  const changeNetwork = useUserStore(state => state.changeNetwork);
  const { ensureLiquidSession } = useLiquidSession();
  const currentMode = getNetworkMode(chain?.chainType);

  const selectNetworkMode = async (mode: NetworkMode) => {
    if (mode === currentMode || pendingMode) {
      return;
    }

    setPendingMode(mode);
    try {
      if (mode === 'private') {
        const isLiquidSessionReady = await ensureLiquidSession(PRIVATE_CHAIN_ID);
        if (!isLiquidSessionReady) {
          return;
        }
      }
      changeNetwork(mode === 'private' ? PRIVATE_CHAIN_ID : PUBLIC_CHAIN_ID);
    } catch {
      // Keep the current mode when the Liquid unlock request is dismissed or fails.
    } finally {
      setPendingMode(null);
    }
  };

  return (
    <View className="min-h-9 flex-row items-center justify-between">
      <Pressable
        className="bg-content1 h-9 w-9 items-center justify-center overflow-hidden rounded-full"
        onPress={() => router.push('/account/manage')}
      >
        {wallet?.image.source ? (
          <Image className="h-6 w-6" source={wallet.image.source} />
        ) : (
          <ThemedIcon className="text-foreground/70" name="person" size={20} />
        )}
      </Pressable>

      <Segment
        size="sm"
        value={currentMode}
        onValueChange={value => void selectNetworkMode(value as NetworkMode)}
      >
        <Segment.Group className="bg-surface">
          <Segment.Indicator />
          <Segment.Item value="public">
            <View className="flex-row items-center gap-1.5">
              <ThemedIcon className="text-muted" name="earth" size={14} />
              <Segment.Label>{t('chain.type.public')}</Segment.Label>
            </View>
          </Segment.Item>
          <Segment.Separator betweenValues={['public', 'private']} />
          <Segment.Item value="private">
            <View className="flex-row items-center gap-1.5">
              <ThemedIcon className="text-muted" name="shield-checkmark" size={14} />
              <Segment.Label>{t('chain.type.private')}</Segment.Label>
            </View>
          </Segment.Item>
        </Segment.Group>
      </Segment>

      <Pressable
        className="h-9 w-9 items-center justify-center rounded-full"
        onPress={() => router.push('/scanner')}
      >
        <ThemedIcon className="text-foreground" name="scan" size={22} />
      </Pressable>
    </View>
  );
};
