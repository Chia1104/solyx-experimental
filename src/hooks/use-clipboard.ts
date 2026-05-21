import { useCallback, useState } from 'react';

import * as Clipboard from 'expo-clipboard';
import type { ToastShowOptions } from 'heroui-native';
import { useToast } from 'heroui-native';
import { useTranslation } from 'react-i18next';

export interface UseClipboardOptions {
  successMessage?: string;
  options?: ToastShowOptions;
  copyDelay?: number;
}

export interface UseClipboardResult {
  copyToClipboard: (value: string) => void;
  pasteFromClipboard: () => Promise<string>;
  clearCopied: () => void;
  copied: boolean;
}

export function useClipboard(options?: UseClipboardOptions): UseClipboardResult {
  const { toast } = useToast();
  const { t } = useTranslation('global');
  const [copied, setCopied] = useState(false);
  const [copyTimeout, setCopyTimeout] = useState<ReturnType<typeof setTimeout> | null>(null);

  const onClearTimeout = useCallback(() => {
    if (copyTimeout) {
      clearTimeout(copyTimeout);
    }
  }, [copyTimeout]);

  const copyToClipboard = useCallback(
    async (value: string) => {
      if (!value || typeof value !== 'string') return;
      onClearTimeout();
      setCopied(true);
      setCopyTimeout(setTimeout(() => setCopied(false), options?.copyDelay ?? 1500));
      await Clipboard.setStringAsync(value);
      toast.show({
        variant: 'success',
        description: options?.successMessage ?? t('notice.copied.to.clipboard'),
        ...options,
      });
    },
    [toast, t, options, onClearTimeout],
  );

  const pasteFromClipboard = useCallback(async () => {
    const text = await Clipboard.getStringAsync();
    await Clipboard.setStringAsync('');
    return text;
  }, []);

  const clearCopied = useCallback(() => {
    onClearTimeout();
    setCopied(false);
  }, [onClearTimeout]);

  return {
    copyToClipboard,
    pasteFromClipboard,
    clearCopied,
    copied,
  };
}
