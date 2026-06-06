import { Accordion, Button, Typography, Alert } from 'heroui-native';
import { EmptyState } from 'heroui-native-pro/empty-state';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { withExpoError } from '@/hocs/with-expo-error';
import { useUserStore } from '@/modules/user/stores/user';

import LogoVertical from './icons/logo-vertical';

export const ExpoError = withExpoError(({ error, retry }) => {
  const { t } = useTranslation(['global']);
  const devMode = useUserStore(store => store.settings.devMode);
  return (
    <View className="flex-1 items-center justify-center">
      <EmptyState>
        <EmptyState.Header>
          <EmptyState.Media>
            <LogoVertical />
          </EmptyState.Media>
          <EmptyState.Title>{t('title.something.went.wrong')}</EmptyState.Title>
          <EmptyState.Description>{t('description.something.went.wrong')}</EmptyState.Description>
        </EmptyState.Header>
        <EmptyState.Content>
          <Button onPress={retry} size="sm">
            <Button.Label>{t('action.reload')}</Button.Label>
          </Button>
          {devMode && (
            <Accordion variant="surface">
              <Accordion.Item value="error">
                <Accordion.Trigger className="min-w-full">
                  <Typography type="body-sm">{t('action.more')}</Typography>
                  <Accordion.Indicator />
                </Accordion.Trigger>
                <Accordion.Content className="flex w-full px-2 py-0">
                  <Alert className="w-full shadow-none" status="danger">
                    <Alert.Indicator />
                    <Alert.Content>
                      <Alert.Title>{error.name}</Alert.Title>
                      <Alert.Description>{error?.message}</Alert.Description>
                    </Alert.Content>
                  </Alert>
                </Accordion.Content>
              </Accordion.Item>
            </Accordion>
          )}
        </EmptyState.Content>
      </EmptyState>
    </View>
  );
});
