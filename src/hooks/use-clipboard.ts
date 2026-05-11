import { useCallback } from 'react';

import * as Clipboard from 'expo-clipboard';
import type { ToastShowOptions } from 'heroui-native';
import { useToast } from 'heroui-native';
import { useTranslation } from 'react-i18next';

export interface UseClipboardOptions {
  successMessage?: string;
  options?: ToastShowOptions;
}

export interface UseClipboardResult {
  copyToClipboard: (value: string) => void;
  pasteFromClipboard: () => Promise<string>;
}

export function useClipboard(options?: UseClipboardOptions): UseClipboardResult {
  const { toast } = useToast();
  const { t } = useTranslation('global');

  const copyToClipboard = useCallback(
    async (value: string) => {
      if (!value || typeof value !== 'string') return;
      await Clipboard.setStringAsync(value);
      toast.show({
        variant: 'success',
        description: options?.successMessage ?? t('notice.copied.to.clipboard'),
        ...options,
      });
    },
    [toast, t, options],
  );

  const pasteFromClipboard = useCallback(async () => {
    const text = await Clipboard.getStringAsync();
    await Clipboard.setStringAsync('');
    return text;
  }, []);

  return {
    copyToClipboard,
    pasteFromClipboard,
  };
}
