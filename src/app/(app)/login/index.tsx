import { useMemo } from 'react';

import { Button } from 'heroui-native';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import Brand from '@/components/brand';
import LogoVertical from '@/components/icons/logo-vertical';
import { ThemedText } from '@/components/ui/themed-text';
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
    <Brand
      display={['background']}
      wrapperProps={{ className: 'justify-between px-6 pt-36 pb-28' }}
    >
      <View className="flex-1 items-center justify-center">
        <LogoVertical />
      </View>

      <View className="w-full gap-3">
        <ThemedText className="text-muted mb-4 text-center text-base">
          {t('description.login.access.full.functions')}
        </ThemedText>

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
    </Brand>
  );
}
