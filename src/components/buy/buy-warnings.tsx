import { Alert } from 'heroui-native';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

export const BuyWarnings = () => {
  const { t } = useTranslation(['defi']);

  return (
    <View className="gap-3">
      <Alert status="danger" className="bg-danger/10">
        <Alert.Indicator />
        <Alert.Content>
          <Alert.Description className="text-danger">
            {t('buyModal.verifyAddressWarning')}
          </Alert.Description>
        </Alert.Content>
      </Alert>

      <Alert status="warning" className="bg-accent/10">
        <Alert.Indicator />
        <Alert.Content>
          <Alert.Description className="text-accent">{t('buyModal.warningText')}</Alert.Description>
        </Alert.Content>
      </Alert>
    </View>
  );
};
