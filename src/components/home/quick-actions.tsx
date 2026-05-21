import { useState } from 'react';

import { useRouter } from 'expo-router';
import { Alert, BottomSheet, Skeleton, Text, cn, useThemeColor } from 'heroui-native';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';

import { CopyAction } from '@/components/ui/copy-action';
import { ThemedIcon } from '@/components/ui/themed-icon';
import { useLiquidReceiveAddress } from '@/modules/chain/hooks/use-liquid-receive-address';
import { useDefiAccount } from '@/modules/defi/hooks/use-defi-account';

export const QuickActions = () => {
  const router = useRouter();
  const { t } = useTranslation(['defi']);
  const [isReceiveOpen, setIsReceiveOpen] = useState(false);

  return (
    <View className="flex-row gap-1">
      <BottomSheet className="flex-1" isOpen={isReceiveOpen} onOpenChange={setIsReceiveOpen}>
        <QuickAction
          icon="arrow-down"
          isHighlighted
          label={t('action.receive')}
          onPress={() => setIsReceiveOpen(true)}
        />
        <BottomSheet.Portal>
          <BottomSheet.Overlay className="bg-background/50" />
          <BottomSheet.Content snapPoints={['60%']}>
            <ReceiveBottomSheetContent isOpen={isReceiveOpen} />
          </BottomSheet.Content>
        </BottomSheet.Portal>
      </BottomSheet>
      <QuickAction icon="arrow-up" label={t('action.send')} onPress={() => router.push('/send')} />
      <QuickAction
        icon="swap-horizontal"
        label={t('action.swap')}
        onPress={() => router.push('/bridge')}
      />
      <QuickAction
        icon="card-outline"
        label={t('action.withdraw')}
        onPress={() => router.push('/kyc/gate')}
      />
    </View>
  );
};

interface ReceiveBottomSheetContentProps {
  isOpen: boolean;
}

const ReceiveBottomSheetContent = ({ isOpen }: ReceiveBottomSheetContentProps) => {
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
    <View className="items-center gap-5 px-5 pb-8">
      <BottomSheet.Title className="text-center">{t('title.receive')}</BottomSheet.Title>

      <View className="bg-surface min-h-[236px] w-full items-center justify-center rounded-3xl p-6">
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
            <View className="bg-surface-secondary mt-5 w-full flex-row items-center gap-2 rounded-2xl px-3 py-3">
              <Text className="text-foreground min-w-0 flex-1" selectable type="body-sm">
                {receiveAddress}
              </Text>
              <CopyAction value={receiveAddress} />
            </View>
          </>
        )}
      </View>

      {chain && !errorText && (
        <Text className="text-foreground/60 text-center" type="body-sm">
          {t('description.only.accept.ethereum', {
            network: chain.name,
          })}
        </Text>
      )}

      {isLIQUID && !errorText && (
        <View className="bg-accent/10 flex-row gap-2 rounded-2xl p-3">
          <ThemedIcon className="text-accent mt-0.5" name="information-circle-outline" size={16} />
          <Text className="text-accent min-w-0 flex-1" type="body-sm">
            {t('description.liquid.receive.address.notice')}
          </Text>
        </View>
      )}
    </View>
  );
};

interface QuickActionProps {
  icon: React.ComponentProps<typeof ThemedIcon>['name'];
  isHighlighted?: boolean;
  label: string;
  onPress: () => void;
}

const QuickAction = ({ icon, isHighlighted = false, label, onPress }: QuickActionProps) => (
  <Pressable
    className={cn(
      'min-h-[80px] flex-1 items-center justify-center gap-1 rounded-xl border py-3',
      isHighlighted
        ? 'border-accent bg-surface-tertiary'
        : 'bg-surface-tertiary border-transparent',
    )}
    onPress={onPress}
  >
    <ThemedIcon
      className={cn(isHighlighted ? 'text-accent' : 'text-foreground')}
      name={icon}
      size={24}
    />
    <Text
      className={cn('text-center', isHighlighted ? 'text-accent' : 'text-foreground')}
      type="body"
      weight="medium"
    >
      {label}
    </Text>
  </Pressable>
);
