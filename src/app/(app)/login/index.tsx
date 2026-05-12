import { useMemo } from 'react';

import { Button, Text } from 'heroui-native';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import LogoVertical from '@/components/icons/logo-vertical';
import { Page } from '@/components/page';
import { useSso } from '@/modules/cefi/hooks/use-sso';

export default function Login() {
  const { t } = useTranslation(['cefi']);
  const { isAuthenticating, openSsoPage } = useSso();

  const actions = useMemo(
    () => [
      {
        label: t('action.login'),
        mode: 'login' as const,
        variant: 'outline' as const,
      },
      {
        label: t('action.signUp'),
        mode: 'signUp' as const,
        variant: 'primary' as const,
      },
    ],
    [t],
  );

  return (
    <Page isBrandVisible className="justify-between px-6 pt-36 pb-28">
      <View className="flex-1 items-center justify-center">
        <LogoVertical />
      </View>

      <View className="w-full gap-3">
        <Text className="text-muted mb-4 text-center text-base" weight="medium">
          {t('description.login.access.full.functions')}
        </Text>

        <View className="w-full flex-row gap-3">
          {actions.map(action => (
            <Button
              className="flex-1"
              isDisabled={isAuthenticating}
              key={action.mode}
              onPress={() => void openSsoPage(action.mode)}
              variant={action.variant}
            >
              <Button.Label>{action.label}</Button.Label>
            </Button>
          ))}
        </View>
      </View>
    </Page>
  );
}
