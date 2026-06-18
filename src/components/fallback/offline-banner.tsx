import { Alert, cn } from 'heroui-native';
import { useTranslation } from 'react-i18next';

interface Props {
  className?: string;
}

/**
 * Slim inline banner for the "soft guard" pattern: shown above
 * cached/persisted content while offline, instead of replacing the screen.
 *
 * @example
 * <NetworkGuard>
 *   {({ isConnected }) => (
 *     <>
 *       {!isConnected && <OfflineBanner />}
 *       <CachedContent />
 *     </>
 *   )}
 * </NetworkGuard>
 */
export const OfflineBanner = ({ className }: Props) => {
  const { t } = useTranslation(['global']);

  return (
    <Alert status="warning" className={cn('shadow-none', className)}>
      <Alert.Indicator />
      <Alert.Content>
        <Alert.Title>{t('notice.no-network.title')}</Alert.Title>
        <Alert.Description>{t('notice.no-network.description')}</Alert.Description>
      </Alert.Content>
    </Alert>
  );
};
