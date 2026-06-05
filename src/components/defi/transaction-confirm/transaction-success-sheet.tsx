import { useCallback, useRef } from 'react';

import { BottomSheet, Button, Typography } from 'heroui-native';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { ThemedIcon } from '@/components/ui/themed-icon';

interface TransactionSuccessSheetProps {
  isOpen: boolean;
  onDismissAfterSuccess?: () => void;
  onGoToActivity?: () => void;
  onOpenChange: (open: boolean) => void;
}

export const TransactionSuccessSheet = ({
  isOpen,
  onDismissAfterSuccess,
  onGoToActivity,
  onOpenChange,
}: TransactionSuccessSheetProps) => {
  const { t } = useTranslation(['defi']);
  const closeReasonRef = useRef<'activity' | null>(null);

  const handleOpenChange = useCallback(
    (open: boolean) => {
      onOpenChange(open);

      if (open) return;

      if (closeReasonRef.current === 'activity') {
        closeReasonRef.current = null;
        return;
      }

      onDismissAfterSuccess?.();
    },
    [onDismissAfterSuccess, onOpenChange],
  );

  const handleGoToActivity = useCallback(() => {
    closeReasonRef.current = 'activity';
    onOpenChange(false);
    onGoToActivity?.();
  }, [onGoToActivity, onOpenChange]);

  return (
    <BottomSheet isOpen={isOpen} onOpenChange={handleOpenChange}>
      <BottomSheet.Portal>
        <BottomSheet.Overlay className="bg-backdrop/50" />
        <BottomSheet.Content>
          <View className="items-center gap-6 px-6 pb-8">
            <BottomSheet.Title className="text-center">
              {t('defi:title.submitted.successfully')}
            </BottomSheet.Title>

            <View className="bg-success/15 h-16 w-16 items-center justify-center rounded-full">
              <ThemedIcon className="text-success" name="checkmark-circle" size={48} />
            </View>

            <Typography className="text-default-foreground px-2 text-center" type="body-sm">
              {t('defi:notice.transaction.is.pending')}
            </Typography>

            <Button className="w-full" onPress={handleGoToActivity} size="sm" variant="primary">
              <Button.Label>{t('defi:action.go.to.activity')}</Button.Label>
            </Button>
          </View>
        </BottomSheet.Content>
      </BottomSheet.Portal>
    </BottomSheet>
  );
};
