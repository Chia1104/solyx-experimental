import { Button, Typography } from 'heroui-native';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

interface BuyUnavailableStateProps {
  onClose: () => void;
}

export const BuyUnavailableState = ({ onClose }: BuyUnavailableStateProps) => {
  const { t } = useTranslation(['defi']);

  return (
    <View className="flex-1 items-center justify-center px-6">
      <Typography className="text-muted text-center">{t('buyModal.description')}</Typography>
      <Button className="mt-6" onPress={onClose} variant="secondary">
        <Button.Label>{t('buyModal.close')}</Button.Label>
      </Button>
    </View>
  );
};
