import { useRouter } from 'expo-router';
import { cn } from 'heroui-native';
import { Segment, useSegment } from 'heroui-native-pro/segment';
import { useTranslation } from 'react-i18next';
import { Image, Pressable, View } from 'react-native';

import { ThemedIcon } from '@/components/ui/themed-icon';
import { useSelectNetworkMode } from '@/hooks/use-select-network-mode';
import type { NetworkMode } from '@/hooks/use-select-network-mode';
import { getNetworkMode } from '@/hooks/use-select-network-mode';
import type { ChainConfig } from '@/modules/chain/stores/chain-adapter/types';
import type { WalletItem } from '@/modules/user/stores/user/types';

interface HomeTopBarProps {
  chain?: ChainConfig;
  wallet?: WalletItem;
}

const SegmentItem = ({
  value,
  label,
  icon,
}: {
  value: string;
  label: string;
  icon: React.ComponentProps<typeof ThemedIcon>['name'];
}) => {
  const segment = useSegment();

  const isSelected = segment.value === value;

  return (
    <Segment.Item value={value} className={cn('flex-row items-center gap-1.5')}>
      <ThemedIcon
        name={icon}
        size={14}
        className={cn(isSelected ? 'text-accent-foreground' : 'text-accent')}
      />
      <Segment.Label className={cn(isSelected ? 'text-accent-foreground' : 'text-accent')}>
        {label}
      </Segment.Label>
    </Segment.Item>
  );
};

export const HomeTopBar = ({ chain, wallet }: HomeTopBarProps) => {
  const router = useRouter();
  const { t } = useTranslation('defi');
  const currentMode = getNetworkMode(chain?.chainType);
  const { selectNetworkMode } = useSelectNetworkMode(currentMode);

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
          <Segment.Indicator className="bg-accent text-accent-foreground" />
          <SegmentItem value="public" label={t('chain.type.public')} icon="earth" />
          <Segment.Separator betweenValues={['public', 'private']} />
          <SegmentItem value="private" label={t('chain.type.private')} icon="shield-checkmark" />
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
