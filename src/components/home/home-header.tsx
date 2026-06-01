import { useRouter } from 'expo-router';
import { Avatar, cn } from 'heroui-native';
import { Segment, useSegment } from 'heroui-native-pro/segment';
import { useTranslation } from 'react-i18next';
import { Image, Pressable } from 'react-native';

import { ThemedIcon } from '@/components/ui/themed-icon';
import type { NetworkMode } from '@/hooks/use-select-network-mode';
import { getNetworkMode, useSelectNetworkMode } from '@/hooks/use-select-network-mode';
import type { ChainConfig } from '@/modules/chain/stores/chain-adapter/types';
import type { WalletItem } from '@/modules/user/stores/user/types';

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

export const SwitchMode = ({ chain }: { chain?: ChainConfig }) => {
  const { t } = useTranslation('defi');
  const currentMode = getNetworkMode(chain?.chainType);
  const { selectNetworkMode } = useSelectNetworkMode(currentMode);
  return (
    <Segment
      size="sm"
      value={currentMode}
      onValueChange={value => selectNetworkMode(value as NetworkMode)}
    >
      <Segment.Group className="bg-surface">
        <Segment.Indicator className="bg-accent text-accent-foreground" />
        <SegmentItem value="public" label={t('chain.type.public')} icon="earth" />
        <Segment.Separator betweenValues={['public', 'private']} />
        <SegmentItem value="private" label={t('chain.type.private')} icon="shield-checkmark" />
      </Segment.Group>
    </Segment>
  );
};

export const AccountAvatar = ({ wallet }: { wallet?: WalletItem }) => {
  const router = useRouter();

  return (
    <Pressable
      className="h-9 w-9 items-center justify-center overflow-hidden rounded-full"
      onPress={() => router.push('/account/manage')}
    >
      <Avatar className="h-9 w-9 bg-transparent">
        <Avatar.Fallback>
          {wallet?.image.source ? (
            <Image className="h-6 w-6" source={wallet.image.source} />
          ) : (
            <ThemedIcon className="text-foreground/70" name="person" size={20} />
          )}
        </Avatar.Fallback>
      </Avatar>
    </Pressable>
  );
};

export const ScannerHeaderButton = () => {
  const router = useRouter();

  return (
    <Pressable
      className="h-9 w-9 items-center justify-center rounded-full"
      onPress={() => router.push('/scanner')}
    >
      <ThemedIcon className="text-foreground" name="scan" size={22} />
    </Pressable>
  );
};
