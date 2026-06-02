import { useState } from 'react';

import { useLocalSearchParams, useRouter } from 'expo-router';
import { Label, ListGroup, useToast } from 'heroui-native';
import { useTranslation } from 'react-i18next';
import { Alert, ScrollView, View } from 'react-native';

import type { ImportProtocol } from '@/components/account/switch-protocol-sheet';
import { SwitchProtocolSheet } from '@/components/account/switch-protocol-sheet';
import { WalletAvatar } from '@/components/account/wallet-avatar';
import { Page } from '@/components/page';
import { ChainType } from '@/modules/chain/stores/chain-adapter/types';
import { compactAddress } from '@/modules/chain/utils/address-display';
import { useMutationWalletDelete } from '@/modules/database/hooks/use-mutation-wallet-delete';
import { useQueryWallets } from '@/modules/database/hooks/use-query-wallets';

export default function AccountDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { t } = useTranslation(['defi']);
  const { toast } = useToast();
  const { data: wallets = [] } = useQueryWallets();

  const [isProtocolSheetOpen, setIsProtocolSheetOpen] = useState(false);

  const wallet = wallets.find(w => w.id === id);
  const walletAddress = wallet?.evmAddress ?? wallet?.tronAddress ?? wallet?.liquidAmpId ?? '';

  const canExportPrivateKey = Boolean(wallet?.evmAddress || wallet?.tronAddress);
  const canDelete = Boolean(wallet?.isImport);

  const handleExportPress = () => {
    if (!wallet) return;
    if (wallet.isImport) {
      const protocol: ImportProtocol = wallet.chains.includes(ChainType.EVM) ? 'evm' : 'tron';
      router.push({
        params: { protocol, walletId: id },
        pathname: '/account/export-private-key',
      });
    } else {
      setIsProtocolSheetOpen(true);
    }
  };

  const handleProtocolConfirm = (protocol: ImportProtocol) => {
    router.push({
      params: { protocol, walletId: id },
      pathname: '/account/export-private-key',
    });
  };

  const deleteMutation = useMutationWalletDelete({
    onError: () => {
      toast.show({ description: t('defi:error.unknown.error'), variant: 'danger' });
    },
    onSuccess: () => {
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
    <Page className="bg-background">
      <ScrollView contentContainerClassName="gap-5 px-3 py-4">
        <View className="items-center gap-2 py-4">
          <WalletAvatar className="h-16 w-16" wallet={wallet} />
          {wallet?.name ? <Label className="text-foreground text-base">{wallet.name}</Label> : null}
          {walletAddress ? (
            <Label className="text-muted text-sm">{compactAddress(walletAddress)}</Label>
          ) : null}
        </View>

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
    </Page>
  );
}
