import { Button } from 'heroui-native';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { SsoMode } from '@/modules/cefi/enums/sso-mode.enum';
import { useSso } from '@/modules/cefi/hooks/use-sso';
import { useUserStore } from '@/modules/user/stores/user';

export const HomeAuthActions = () => {
  const { t } = useTranslation(['cefi']);
  const isLoggedIn = useUserStore(state => state.cefiUserAccount.isLogin);
  const { isAuthenticating, openSsoPage } = useSso();

  if (isLoggedIn) {
    return null;
  }

  return (
    <View className="flex-row gap-3">
      <Button
        className="flex-1"
        isDisabled={isAuthenticating}
        onPress={() => void openSsoPage(SsoMode.Login)}
        variant="outline"
      >
        <Button.Label>{t('action.login')}</Button.Label>
      </Button>
      <Button
        className="flex-1"
        isDisabled={isAuthenticating}
        onPress={() => void openSsoPage(SsoMode.SignUp)}
        variant="primary"
      >
        <Button.Label>{t('action.signUp')}</Button.Label>
      </Button>
    </View>
  );
};
