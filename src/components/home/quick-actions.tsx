import type { ReactNode } from 'react';
import { useCallback, useState } from 'react';

import { useRouter } from 'expo-router';
import { Alert, BottomSheet, Card, Skeleton, Typography, cn, useThemeColor } from 'heroui-native';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';

import { AddressDisplay } from '@/components/ui/address-display';
import { CopyAction } from '@/components/ui/copy-action';
import {
  ThemedFontAwesomeIcon,
  ThemedIcon,
  ThemedMaterialDesignIcon,
} from '@/components/ui/themed-icon';
import { CefiPlusKYCStatus } from '@/modules/cefi/enums/users.enum';
import { useQueryMeta } from '@/modules/cefi/hooks/use-query-meta';
import {
  isCoinbaseOnrampEnabled,
  isDefiWithdrawalEnabled,
} from '@/modules/cefi/utils/app-features';
import { useLiquidReceiveAddress } from '@/modules/chain/hooks/use-liquid-receive-address';
import { useDefiAccount } from '@/modules/defi/hooks/use-defi-account';
import { useUserStore } from '@/modules/user/stores/user';

export const QuickActions = () => {
  const router = useRouter();
  const { t } = useTranslation(['defi']);
  const [isReceiveOpen, setIsReceiveOpen] = useState(false);
  const { data: meta } = useQueryMeta();
  const { currentChainId } = useDefiAccount();
  const userData = useUserStore(state => state.cefiUserAccount.userData);

  const coinbaseOnrampEnabled = isCoinbaseOnrampEnabled(meta, currentChainId);
  const defiWithdrawalEnabled = isDefiWithdrawalEnabled(meta);

  /**
   * @TODO
   * Use Stack guard to handle the withdrawal logic
   */
  const handleWithdrawPress = useCallback(() => {
    if (!defiWithdrawalEnabled) {
      return;
    }

    if (userData.plusKYCStatus === CefiPlusKYCStatus.Pass) {
      router.push('/withdraw');
      return;
    }

    router.push('/kyc/gate');
  }, [defiWithdrawalEnabled, router, userData.plusKYCStatus]);

  return (
    <View className="flex-row gap-1">
      <BottomSheet className="flex-1" isOpen={isReceiveOpen} onOpenChange={setIsReceiveOpen}>
        <QuickAction
          isHighlighted
          label={t('action.receive')}
          onPress={() => setIsReceiveOpen(true)}
          renderIcon={className => <ThemedIcon className={className} name="arrow-down" size={24} />}
        />
        <BottomSheet.Portal>
          <BottomSheet.Overlay className="bg-background/50" />
          <BottomSheet.Content>
            <ReceiveBottomSheetContent isOpen={isReceiveOpen} />
          </BottomSheet.Content>
        </BottomSheet.Portal>
      </BottomSheet>
      <QuickAction
        label={t('action.send')}
        onPress={() => router.push('/send')}
        renderIcon={className => <ThemedIcon className={className} name="arrow-up" size={24} />}
      />
      {coinbaseOnrampEnabled ? (
        <QuickAction
          label={t('action.buy')}
          onPress={() => router.push('/buy')}
          renderIcon={className => (
            <ThemedFontAwesomeIcon className={className} name="dollar" size={24} />
          )}
        />
      ) : (
        <QuickAction
          label={t('action.swap')}
          onPress={() => router.push('/bridge')}
          renderIcon={className => (
            <ThemedIcon className={className} name="swap-horizontal" size={24} />
          )}
        />
      )}
      <QuickAction
        disabled={!defiWithdrawalEnabled}
        label={t('action.withdraw')}
        onPress={handleWithdrawPress}
        renderIcon={className => (
          <ThemedMaterialDesignIcon className={className} name="bank-outline" size={24} />
        )}
      />
    </View>
  );
};

interface ReceiveBottomSheetContentProps {
  isOpen: boolean;
}

export const ReceiveBottomSheetContent = ({ isOpen }: ReceiveBottomSheetContentProps) => {
  const { t } = useTranslation(['defi']);
  const [foregroundColor] = useThemeColor(['foreground']);
  const { chain, currentAddress, isLIQUID, liquidAmpId, liquidSubaccountPointer } =
    useDefiAccount();
  const liquidReceiveAddressQuery = useLiquidReceiveAddress(
    {
      ampId: liquidAmpId,
      subaccount: liquidSubaccountPointer ?? 0,
    },
    {
      enabled: isOpen && isLIQUID && Boolean(liquidAmpId),
    },
  );
  const receiveAddress = isLIQUID
    ? (liquidReceiveAddressQuery.data?.confidential ?? '')
    : currentAddress;
  const isLoading = isLIQUID && liquidReceiveAddressQuery.isFetching;
  const hasNoReceiveAddress = !isLoading && (!chain || !receiveAddress);
  const errorText =
    !isLoading && isLIQUID && liquidReceiveAddressQuery.error
      ? t('description.home.asset.unavailable')
      : hasNoReceiveAddress
        ? t('description.home.no.wallet')
        : '';

  return (
    <View className="items-center gap-5 px-3 pb-8">
      <BottomSheet.Title className="text-center">{t('title.receive')}</BottomSheet.Title>

      {errorText ? (
        <Alert className="w-full" status={liquidReceiveAddressQuery.error ? 'danger' : 'warning'}>
          <Alert.Indicator />
          <Alert.Content>
            <Alert.Description>{errorText}</Alert.Description>
          </Alert.Content>
        </Alert>
      ) : isLoading ? (
        <View className="w-full items-center">
          <Skeleton className="h-[180px] w-[180px] rounded-2xl" />
          <Skeleton className="mt-5 h-12 w-full rounded-2xl" />
        </View>
      ) : (
        <>
          <QRCode
            backgroundColor="transparent"
            color={foregroundColor}
            size={180}
            value={receiveAddress}
          />
          <Card className="flex-row items-center gap-2">
            <AddressDisplay
              address={receiveAddress}
              className="min-w-0 flex-1"
              selectable
              variant="highlighted"
            />
            <CopyAction value={receiveAddress} />
          </Card>
        </>
      )}

      {chain && !errorText && (
        <Typography className="text-foreground/60 text-center" type="body-sm">
          {t('description.only.accept.ethereum', {
            network: chain.name,
          })}
        </Typography>
      )}

      {isLIQUID && !errorText && (
        <View className="bg-accent/10 flex-row gap-2 rounded-2xl p-3">
          <ThemedIcon className="text-accent mt-0.5" name="information-circle-outline" size={16} />
          <Typography className="text-accent min-w-0 flex-1" type="body-sm">
            {t('description.liquid.receive.address.notice')}
          </Typography>
        </View>
      )}
    </View>
  );
};

export interface QuickActionProps {
  disabled?: boolean;
  isHighlighted?: boolean;
  label: string;
  onPress: () => void;
  renderIcon: (className: string) => ReactNode;
}

export const QuickAction = ({
  disabled = false,
  isHighlighted = false,
  label,
  onPress,
  renderIcon,
}: QuickActionProps) => {
  const iconClassName = isHighlighted ? 'text-accent' : 'text-foreground';

  return (
    <Pressable
      className={cn(
        'min-h-[80px] flex-1 items-center justify-center gap-1 rounded-xl border py-3',
        isHighlighted
          ? 'border-accent bg-surface-tertiary'
          : 'bg-surface-tertiary border-transparent',
        disabled && 'opacity-50',
      )}
      disabled={disabled}
      onPress={onPress}
    >
      {renderIcon(iconClassName)}
      <Typography
        className={cn('text-center', isHighlighted ? 'text-accent' : 'text-foreground')}
        type="body-sm"
      >
        {label}
      </Typography>
    </Pressable>
  );
};
