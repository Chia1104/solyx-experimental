import { BottomSheet, Button, Text } from 'heroui-native';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { ThemedIcon } from '@/components/ui/themed-icon';

interface TransactionSuccessSheetProps {
  isOpen: boolean;
  onGoToActivity: () => void;
  onOpenChange: (open: boolean) => void;
}

export const TransactionSuccessSheet = ({
  isOpen,
  onGoToActivity,
  onOpenChange,
}: TransactionSuccessSheetProps) => {
  const { t } = useTranslation(['defi']);

  return (
    <BottomSheet isOpen={isOpen} onOpenChange={onOpenChange}>
      <BottomSheet.Portal>
        <BottomSheet.Overlay className="bg-background/50" />
        <BottomSheet.Content snapPoints={['42%']}>
          <View className="items-center gap-6 px-6 pb-8">
            <BottomSheet.Title className="text-center">
              {t('defi:title.submitted.successfully')}
            </BottomSheet.Title>

            <View className="bg-success/15 h-16 w-16 items-center justify-center rounded-full">
              <ThemedIcon className="text-success" name="checkmark-circle" size={48} />
            </View>

            <Text className="text-default-foreground px-2 text-center" type="body-sm">
              {t('defi:notice.transaction.is.pending')}
            </Text>

            <Button className="w-full" onPress={onGoToActivity} size="sm" variant="primary">
              <Button.Label>{t('defi:action.go.to.activity')}</Button.Label>
            </Button>
          </View>
        </BottomSheet.Content>
      </BottomSheet.Portal>
    </BottomSheet>
  );
};
