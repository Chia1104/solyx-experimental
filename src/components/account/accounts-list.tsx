import { Label, ListGroup, Separator } from 'heroui-native';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { ThemedIcon } from '@/components/ui/themed-icon';
import { ChainType } from '@/modules/chain/stores/chain-adapter/types';
import { ADDRESS_COMPACT_PRESETS, compactAddress } from '@/modules/chain/utils/address-display';
import { useChangeAccount } from '@/modules/defi/hooks/use-change-account';
import { useDefiAccount } from '@/modules/defi/hooks/use-defi-account';
import type { WalletItem } from '@/modules/user/stores/user/types';

import { WalletAvatar } from './wallet-avatar';

interface AccountsListProps {
  onAccountSelected?: () => void;
  isSelectable?: boolean;
  onAccountPress?: (walletId: string) => void;
}

interface WalletListGroupItemProps {
  data: WalletItem;
  isActive: boolean;
  onPress: () => void;
  isSelectable?: boolean;
}

const WalletListGroupItem = ({
  data,
  isActive,
  onPress,
  isSelectable = true,
}: WalletListGroupItemProps) => {
  const { chainType } = useDefiAccount();

  const address =
    data.chains.includes(ChainType.EVM) && data.evmAddress
      ? data.evmAddress
      : data.chains.includes(ChainType.TRON) && data.tronAddress
        ? data.tronAddress
        : data.chains.includes(ChainType.LIQUID) && data.liquidAmpId
          ? data.liquidAmpId
          : '';

  return (
    <ListGroup.Item className="py-2 pl-0" onPress={onPress}>
      <ListGroup.ItemPrefix>
        <WalletAvatar wallet={data} />
      </ListGroup.ItemPrefix>
      <ListGroup.ItemContent>
        <ListGroup.ItemTitle>{data.name}</ListGroup.ItemTitle>
        {data.isImport && address ? (
          <ListGroup.ItemDescription>
            {compactAddress(
              address,
              chainType === ChainType.LIQUID
                ? ADDRESS_COMPACT_PRESETS.liquid
                : ADDRESS_COMPACT_PRESETS.default,
            )}
          </ListGroup.ItemDescription>
        ) : null}
      </ListGroup.ItemContent>
      {isSelectable ? (
        isActive ? (
          <ListGroup.ItemSuffix>
            <ThemedIcon className="text-accent" name="checkmark" size={18} />
          </ListGroup.ItemSuffix>
        ) : null
      ) : (
        <ListGroup.ItemSuffix />
      )}
    </ListGroup.Item>
  );
};

interface WalletListGroupProps {
  wallets: WalletItem[];
  currentWalletId: string;
  onAccountPress: (walletId: string) => void;
  isSelectable?: boolean;
}

const WalletListGroup = ({
  currentWalletId,
  onAccountPress,
  wallets,
  isSelectable = true,
}: WalletListGroupProps) => {
  if (wallets.length === 0) {
    return null;
  }

  return (
    <ListGroup variant="transparent">
      {wallets.map(wallet => (
        <WalletListGroupItem
          data={wallet}
          isActive={currentWalletId === wallet.id}
          key={wallet.id}
          onPress={() => onAccountPress(wallet.id)}
          isSelectable={isSelectable}
        />
      ))}
    </ListGroup>
  );
};

export const AccountsList = ({
  onAccountSelected,
  isSelectable = true,
  onAccountPress: onAccountPressProp,
}: AccountsListProps) => {
  const { t } = useTranslation(['defi']);
  const { changeAccount } = useChangeAccount();
  const { currentWalletId, mnemonicWallets, privateKeyWallets } = useDefiAccount();

  const handleAccountPress = async (walletId: string) => {
    if (onAccountPressProp) {
      onAccountPressProp(walletId);
      return;
    }
    const changed = await changeAccount(walletId);
    if (changed) {
      onAccountSelected?.();
    }
  };

  return (
    <View className="gap-4">
      <WalletListGroup
        currentWalletId={currentWalletId}
        onAccountPress={walletId => void handleAccountPress(walletId)}
        wallets={mnemonicWallets}
        isSelectable={isSelectable}
      />

      {privateKeyWallets.length > 0 ? (
        <>
          <Separator className="mb-4" />
          <View>
            <Label className="text-muted mb-2 px-2">{t('defi:label.private.key.wallet')}</Label>
            <WalletListGroup
              currentWalletId={currentWalletId}
              onAccountPress={walletId => void handleAccountPress(walletId)}
              wallets={privateKeyWallets}
              isSelectable={isSelectable}
            />
          </View>
        </>
      ) : null}
    </View>
  );
};
