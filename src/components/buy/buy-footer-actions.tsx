import { Button } from 'heroui-native';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

interface BuyFooterActionsProps {
  isSubmitting: boolean;
  onCancel: () => void;
  onContinue: () => void;
}

export const BuyFooterActions = ({ isSubmitting, onCancel, onContinue }: BuyFooterActionsProps) => {
  const { t } = useTranslation(['defi']);

  return (
    <View className="mt-6 flex-row gap-3">
      <Button className="flex-1" onPress={onCancel} variant="outline" size="sm">
        <Button.Label>{t('buyModal.cancel')}</Button.Label>
      </Button>
      <Button
        className="flex-1"
        isDisabled={isSubmitting}
        onPress={onContinue}
        variant="primary"
        size="sm"
      >
        <Button.Label>{t('buyModal.continue')}</Button.Label>
      </Button>
    </View>
  );
};
