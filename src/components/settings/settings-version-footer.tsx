import Constants from 'expo-constants';
import { Typography } from 'heroui-native';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

export const SettingsVersionFooter = () => {
  const { t } = useTranslation(['global']);
  const version = Constants.expoConfig?.version ?? 'develop';

  return (
    <View className="">
      <Typography className="text-foreground/60" type="body">
        {t('default.version', { version })}
      </Typography>
    </View>
  );
};
