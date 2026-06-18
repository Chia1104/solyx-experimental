import * as Network from 'expo-network';
import { Button } from 'heroui-native';
import { EmptyState } from 'heroui-native-pro/empty-state';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { ThemedIcon } from '@/components/ui/themed-icon';
import { queryClient } from '@/libs/request/query-client';

interface Props {
  /**
   * Override the retry behaviour. By default we re-probe connectivity and, if
   * back online, invalidate queries to force a refetch. (With `useOnlineManager`
   * wired, paused queries also resume on reconnect on their own — this button is
   * mostly an explicit "check again now".)
   */
  onRetry?: () => void;
  className?: string;
}

const defaultRetry = () => {
  void Network.getNetworkStateAsync().then(state => {
    if (state.isConnected) {
      void queryClient.invalidateQueries();
    }
  });
};

export const NetworkOfflineFallback = ({ onRetry, className }: Props) => {
  const { t } = useTranslation(['global']);

  return (
    <View className={className ?? 'flex-1 items-center justify-center px-6'}>
      <EmptyState>
        <EmptyState.Header>
          <EmptyState.Media>
            <ThemedIcon name="cloud-offline-outline" size={48} />
          </EmptyState.Media>
          <EmptyState.Title>{t('notice.no-network.title')}</EmptyState.Title>
          <EmptyState.Description>{t('notice.no-network.description')}</EmptyState.Description>
        </EmptyState.Header>
        <EmptyState.Content>
          <Button onPress={onRetry ?? defaultRetry} size="sm">
            <Button.Label>{t('action.retry')}</Button.Label>
          </Button>
        </EmptyState.Content>
      </EmptyState>
    </View>
  );
};
