import { Button } from 'heroui-native';

import type { UseClipboardOptions } from '@/hooks/use-clipboard';
import { useClipboard } from '@/hooks/use-clipboard';

import { ThemedIcon } from './themed-icon';

interface CopyActionProps extends UseClipboardOptions {
  value: string;
}

export const CopyAction = ({ value, ...options }: CopyActionProps) => {
  const { copyToClipboard, copied } = useClipboard(options);
  return (
    <Button isIconOnly onPress={() => copyToClipboard(value)} variant="ghost" size="sm">
      <ThemedIcon
        name={copied ? 'checkmark-outline' : 'copy-outline'}
        className="text-primary-foreground"
        size={18}
      />
    </Button>
  );
};
