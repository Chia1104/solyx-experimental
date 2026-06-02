import { Avatar, cn } from 'heroui-native';
import type { ImageSourcePropType } from 'react-native';
import { Image } from 'react-native';

import { ThemedIcon } from '@/components/ui/themed-icon';
import type { WalletItem } from '@/modules/user/stores/user/types';

interface WalletAvatarProps {
  className?: string;
  iconSize?: number;
  imageClassName?: string;
  imageSource?: ImageSourcePropType;
  wallet?: Pick<WalletItem, 'image'>;
}

export const WalletAvatar = ({
  className,
  iconSize = 20,
  imageClassName = 'h-6 w-6',
  imageSource,
  wallet,
}: WalletAvatarProps) => {
  const source = imageSource ?? wallet?.image.source;

  return (
    <Avatar className={cn('bg-transparent', className)}>
      <Avatar.Fallback>
        {source ? (
          <Image className={imageClassName} source={source} />
        ) : (
          <ThemedIcon className="text-foreground/70" name="person" size={iconSize} />
        )}
      </Avatar.Fallback>
    </Avatar>
  );
};
