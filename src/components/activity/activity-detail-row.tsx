import type { ReactNode } from 'react';
import { memo } from 'react';

import { Typography } from 'heroui-native';
import { View } from 'react-native';

interface ActivityDetailRowProps {
  label: string;
  children: ReactNode;
}

export const ActivityDetailRow = memo(({ label, children }: ActivityDetailRowProps) => (
  <View className="flex-row items-center justify-between gap-3">
    <Typography className="text-default-foreground shrink-0" type="body-sm">
      {label}
    </Typography>
    <View className="min-w-0 flex-1 items-end">{children}</View>
  </View>
));

ActivityDetailRow.displayName = 'ActivityDetailRow';
