import { useState } from 'react';

import { useRouter } from 'expo-router';
import { Label, ListGroup, useToast } from 'heroui-native';
import { useTranslation } from 'react-i18next';
import { Alert, ScrollView, View } from 'react-native';

import { ChainType } from '@/modules/chain/stores/chain-adapter/types';
import { compactAddress } from '@/modules/chain/utils/address-display';
import { useMutationWalletDelete } from '@/modules/database/hooks/use-mutation-wallet-delete';
import { useChangeAccount } from '@/modules/defi/hooks/use-change-account';
import { useDefiAccount } from '@/modules/defi/hooks/use-defi-account';
import type { WalletItem } from '@/modules/user/stores/user/types';

import type { ImportProtocol } from './switch-protocol-sheet';
import { SwitchProtocolSheet } from './switch-protocol-sheet';
import { WalletAvatar } from './wallet-avatar';

interface AccountManagementContentProps {
  wallet: WalletItem | undefined;
}

export const AccountManagementContent = ({ wallet }: AccountManagementContentProps) => {
  const router = useRouter();
  const { t } = useTranslation(['defi']);
  const { toast } = useToast();

  const [isProtocolSheetOpen, setIsProtocolSheetOpen] = useState(false);
  const { mnemonicWallets } = useDefiAccount();
  const { changeAccount } = useChangeAccount();

  const walletAddress = wallet?.evmAddress ?? wallet?.tronAddress ?? wallet?.liquidAmpId ?? '';
  const canExportPrivateKey = Boolean(wallet?.evmAddress || wallet?.tronAddress);
  const canDelete = Boolean(wallet?.isImport);

  const handleExportPress = () => {
    if (!wallet) return;
    if (wallet.isImport) {
      const protocol: ImportProtocol = wallet.chains.includes(ChainType.EVM) ? 'evm' : 'tron';
      router.push({
        params: { protocol, walletId: wallet.id },
        pathname: '/account/export-private-key',
      });
    } else {
      setIsProtocolSheetOpen(true);
    }
  };

  const handleProtocolConfirm = (protocol: ImportProtocol) => {
    router.push({
      params: { protocol, walletId: wallet?.id },
      pathname: '/account/export-private-key',
    });
  };

  const deleteMutation = useMutationWalletDelete({
    onError: () => {
      toast.show({ description: t('defi:error.unknown.error'), variant: 'danger' });
    },
    onSuccess: async () => {
      const firstHD = mnemonicWallets[0];
      if (firstHD) {
        await changeAccount(firstHD.id);
      }
      router.back();
    },
  });

  const handleDelete = () => {
    Alert.alert(t('defi:title.delete.account'), undefined, [
      { style: 'cancel', text: 'Cancel' },
      {
        onPress: () => void deleteMutation.mutateAsync(walletAddress),
        style: 'destructive',
        text: t('defi:action.delete.this.account'),
      },
    ]);
  };

  return (
    <>
      <ScrollView contentContainerClassName="gap-5 px-3 py-4">
        <View className="items-center gap-2 py-4">
          <WalletAvatar className="h-16 w-16" wallet={wallet} />
          {wallet?.name ? <Label className="text-foreground text-base">{wallet.name}</Label> : null}
          {walletAddress ? (
            <Label className="text-muted text-sm">{compactAddress(walletAddress)}</Label>
          ) : null}
        </View>

        <ListGroup>
          <ListGroup.Item
            onPress={() =>
              router.push({ params: { walletId: wallet?.id }, pathname: '/account/edit-info' })
            }
          >
            <ListGroup.ItemContent>
              <ListGroup.ItemTitle>{t('defi:title.account.info')}</ListGroup.ItemTitle>
            </ListGroup.ItemContent>
            <ListGroup.ItemSuffix />
          </ListGroup.Item>
        </ListGroup>

        {canExportPrivateKey ? (
          <ListGroup>
            <ListGroup.Item onPress={handleExportPress}>
              <ListGroup.ItemContent>
                <ListGroup.ItemTitle>{t('defi:action.export.private.key')}</ListGroup.ItemTitle>
              </ListGroup.ItemContent>
              <ListGroup.ItemSuffix />
            </ListGroup.Item>
          </ListGroup>
        ) : null}

        {canDelete ? (
          <ListGroup>
            <ListGroup.Item onPress={handleDelete}>
              <ListGroup.ItemContent>
                <ListGroup.ItemTitle className="text-danger">
                  {t('defi:action.delete.this.account')}
                </ListGroup.ItemTitle>
              </ListGroup.ItemContent>
            </ListGroup.Item>
          </ListGroup>
        ) : null}
      </ScrollView>

      <SwitchProtocolSheet
        isOpen={isProtocolSheetOpen}
        onConfirm={handleProtocolConfirm}
        onOpenChange={setIsProtocolSheetOpen}
      />
    </>
  );
};
