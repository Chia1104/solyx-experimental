import { Alert } from 'heroui-native';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

export const BuyWarnings = () => {
  const { t } = useTranslation(['defi']);

  return (
    <View className="gap-3">
      <Alert status="danger">
        <Alert.Indicator />
        <Alert.Content>
          <Alert.Description>{t('buyModal.verifyAddressWarning')}</Alert.Description>
        </Alert.Content>
      </Alert>

      <Alert status="warning">
        <Alert.Indicator />
        <Alert.Content>
          <Alert.Description>{t('buyModal.warningText')}</Alert.Description>
        </Alert.Content>
      </Alert>
    </View>
  );
};
