import { Button } from 'heroui-native';
import type { ButtonRootProps } from 'heroui-native';

import type { UseClipboardOptions } from '@/hooks/use-clipboard';
import { useClipboard } from '@/hooks/use-clipboard';

import { ThemedIcon } from './themed-icon';
import type { ThemedIconProps } from './themed-icon';

interface CopyActionProps extends UseClipboardOptions {
  value: string;
  buttonProps?: Partial<ButtonRootProps>;
  iconProps?: Partial<ThemedIconProps>;
}

export const CopyAction = ({ value, buttonProps, iconProps, ...options }: CopyActionProps) => {
  const { copyToClipboard, copied } = useClipboard(options);
  return (
    <Button
      isIconOnly
      variant="ghost"
      size="sm"
      {...buttonProps}
      onPress={() => copyToClipboard(value)}
    >
      <ThemedIcon name={copied ? 'checkmark-outline' : 'copy-outline'} size={18} {...iconProps} />
    </Button>
  );
};
