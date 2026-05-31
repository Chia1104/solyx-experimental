import { memo } from 'react';

import { View } from 'react-native';

import { ThemedIcon } from '@/components/ui/themed-icon';
import type { ActionKey } from '@/modules/database/enums/defi-record.enum';

interface ActivityActionIconProps {
  actionKey: ActionKey;
}

export const ActivityActionIcon = memo(({ actionKey }: ActivityActionIconProps) => {
  const renderIcon = () => {
    switch (actionKey) {
      case 'sent':
        return <ThemedIcon className="text-foreground" name="arrow-up" size={24} />;
      case 'received':
        return <ThemedIcon className="text-foreground" name="arrow-down" size={24} />;
      case 'swap':
        return <ThemedIcon className="text-foreground" name="swap-horizontal" size={24} />;
      case 'approve':
        return <ThemedIcon className="text-foreground" name="checkmark-circle-outline" size={24} />;
      default:
        return <ThemedIcon className="text-foreground" name="document-text-outline" size={24} />;
    }
  };

  return <View className="border-separator rounded-full border p-2">{renderIcon()}</View>;
});

ActivityActionIcon.displayName = 'ActivityActionIcon';
