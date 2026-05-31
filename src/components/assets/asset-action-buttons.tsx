import { memo, useCallback, useState } from 'react';

import { useRouter } from 'expo-router';
import { BottomSheet } from 'heroui-native';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { QuickAction, ReceiveBottomSheetContent } from '@/components/home/quick-actions';
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
import { useDefiAccount } from '@/modules/defi/hooks/use-defi-account';
import type { AssetActionFlags } from '@/modules/defi/utils/asset-action-flags.utils';
import { useUserStore } from '@/modules/user/stores/user';

interface AssetActionButtonsProps {
  actionFlags: AssetActionFlags;
  isLIQUID: boolean;
  isNativeToken: boolean;
  tokenAddress: string;
  tokenSymbol: string;
}

export const AssetActionButtons = memo(
  ({
    actionFlags,
    isLIQUID,
    isNativeToken,
    tokenAddress,
    tokenSymbol,
  }: AssetActionButtonsProps) => {
    const router = useRouter();
    const { t } = useTranslation(['defi']);
    const [isReceiveOpen, setIsReceiveOpen] = useState(false);
    const { data: meta } = useQueryMeta();
    const { currentChainId } = useDefiAccount();
    const userData = useUserStore(state => state.cefiUserAccount.userData);

    const coinbaseOnrampEnabled = isCoinbaseOnrampEnabled(meta, currentChainId);
    const defiWithdrawalEnabled = isDefiWithdrawalEnabled(meta);

    const handleWithdrawPress = useCallback(() => {
      if (!defiWithdrawalEnabled || actionFlags.withdrawDisabled) {
        return;
      }

      if (userData.plusKYCStatus === CefiPlusKYCStatus.Pass) {
        router.push('/withdraw');
        return;
      }

      router.push('/kyc/gate');
    }, [actionFlags.withdrawDisabled, defiWithdrawalEnabled, router, userData.plusKYCStatus]);

    const handleSendPress = useCallback(() => {
      router.push({
        pathname: '/send/[token]',
        params: { token: tokenAddress },
      });
    }, [router, tokenAddress]);

    const handleSwapPress = useCallback(() => {
      router.push('/bridge');
    }, [router]);

    const handleBuyPress = useCallback(() => {
      router.push({
        pathname: '/buy',
        params: { symbol: tokenSymbol },
      });
    }, [router, tokenSymbol]);

    const receiveAction = (
      <BottomSheet className="flex-1" isOpen={isReceiveOpen} onOpenChange={setIsReceiveOpen}>
        <QuickAction
          isHighlighted
          label={t('action.receive')}
          onPress={() => setIsReceiveOpen(true)}
          renderIcon={className => <ThemedIcon className={className} name="arrow-down" size={24} />}
        />
        <BottomSheet.Portal>
          <BottomSheet.Overlay className="bg-background/50" />
          <BottomSheet.Content snapPoints={['60%']}>
            <ReceiveBottomSheetContent isOpen={isReceiveOpen} />
          </BottomSheet.Content>
        </BottomSheet.Portal>
      </BottomSheet>
    );

    const sendAction = (
      <QuickAction
        label={t('action.send')}
        onPress={handleSendPress}
        renderIcon={className => <ThemedIcon className={className} name="arrow-up" size={24} />}
      />
    );

    const swapAction = actionFlags.showSwap ? (
      <QuickAction
        label={t('action.swap')}
        onPress={handleSwapPress}
        renderIcon={className => (
          <ThemedIcon className={className} name="swap-horizontal" size={24} />
        )}
      />
    ) : null;

    const buyAction =
      actionFlags.showBuy && coinbaseOnrampEnabled ? (
        <QuickAction
          label={t('action.buy')}
          onPress={handleBuyPress}
          renderIcon={className => (
            <ThemedFontAwesomeIcon className={className} name="dollar" size={24} />
          )}
        />
      ) : null;

    const withdrawAction = actionFlags.showWithdraw ? (
      <QuickAction
        disabled={!defiWithdrawalEnabled || actionFlags.withdrawDisabled}
        label={t('action.withdraw')}
        onPress={handleWithdrawPress}
        renderIcon={className => (
          <ThemedMaterialDesignIcon className={className} name="bank-outline" size={24} />
        )}
      />
    ) : null;

    const shieldAction = actionFlags.showShield ? (
      <QuickAction
        isHighlighted
        label={t('action.shield')}
        onPress={() => undefined}
        renderIcon={className => (
          <ThemedIcon className={className} name="shield-checkmark" size={24} />
        )}
      />
    ) : null;

    const unshieldAction = actionFlags.showUnshield ? (
      <QuickAction
        isHighlighted
        label={t('action.unshield')}
        onPress={() => undefined}
        renderIcon={className => (
          <ThemedIcon className={className} name="lock-open-outline" size={24} />
        )}
      />
    ) : null;

    if (isNativeToken) {
      return (
        <View className="w-full gap-2 px-4 pb-8">
          <View className="flex-row gap-1">
            {receiveAction}
            {sendAction}
            {swapAction}
            {buyAction}
          </View>
        </View>
      );
    }

    if (!isLIQUID) {
      const showFirstRow = actionFlags.showShield || actionFlags.showSwap;

      return (
        <View className="w-full gap-2 px-4 pb-8">
          {showFirstRow ? (
            <View className="flex-row gap-1">
              {shieldAction}
              {swapAction}
            </View>
          ) : null}
          <View className="flex-row gap-1">
            {receiveAction}
            {sendAction}
            {buyAction}
            {withdrawAction}
          </View>
        </View>
      );
    }

    return (
      <View className="w-full gap-2 px-4 pb-8">
        <View className="flex-row gap-1">
          {unshieldAction}
          {receiveAction}
          {sendAction}
        </View>
        <View className="flex-row gap-1">
          {swapAction}
          {withdrawAction}
        </View>
      </View>
    );
  },
);

AssetActionButtons.displayName = 'AssetActionButtons';
