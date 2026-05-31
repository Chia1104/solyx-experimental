import { memo, useCallback, useMemo } from 'react';

import { Button, Typography, cn } from 'heroui-native';
import { useTranslation } from 'react-i18next';
import { Linking, View } from 'react-native';

import { useDefiAccount } from '@/modules/defi/hooks/use-defi-account';
import { buildAddressExplorerUrl } from '@/modules/defi/utils/activity-transaction.utils';

interface ActivityExplorerLinkProps {
  align?: 'center' | 'start';
  applyEmptySpacing?: boolean;
  buttonLabel?: string;
  className?: string;
  hasRecords?: boolean;
  showMessage?: boolean;
}

export const ActivityExplorerLink = memo(
  ({
    align = 'center',
    applyEmptySpacing = true,
    buttonLabel,
    className,
    hasRecords = false,
    showMessage = true,
  }: ActivityExplorerLinkProps) => {
    const { t } = useTranslation(['defi', 'global']);
    const { chain, chainType, currentAddress, isLIQUID } = useDefiAccount();

    const explorerUrl = useMemo(
      () => buildAddressExplorerUrl({ address: currentAddress, chain, chainType }),
      [chain, chainType, currentAddress],
    );

    const onPress = useCallback(() => {
      if (!explorerUrl) {
        return;
      }

      void Linking.openURL(explorerUrl);
    }, [explorerUrl]);

    if (isLIQUID || !explorerUrl) {
      return null;
    }

    return (
      <View
        className={cn(
          align === 'start' ? 'items-start self-start' : 'items-center',
          applyEmptySpacing && (hasRecords ? 'mt-6 mb-8' : 'mt-4 mb-8'),
          !applyEmptySpacing && align === 'center' && 'items-center',
          className,
        )}
      >
        {showMessage ? (
          <Typography className="text-warning-foreground text-center" type="body-xs">
            {t('action.need.more')}
          </Typography>
        ) : null}
        <Button
          className="border-accent h-8 self-center rounded-lg px-2"
          size="sm"
          variant="outline"
          onPress={onPress}
        >
          <Button.Label className="text-accent text-xs">
            {buttonLabel ??
              t('global:description.check.on.scanner', {
                scanner: chain?.blockExplorers.default.name,
              })}
          </Button.Label>
        </Button>
      </View>
    );
  },
);

ActivityExplorerLink.displayName = 'ActivityExplorerLink';
