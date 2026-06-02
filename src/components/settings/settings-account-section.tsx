import { useRouter } from 'expo-router';
import { Label, ListGroup } from 'heroui-native';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { WalletAvatar } from '@/components/account/wallet-avatar';
import { compactAddress } from '@/modules/chain/utils/address-display';
import { useDefiAccount } from '@/modules/defi/hooks/use-defi-account';
import { useUserStore } from '@/modules/user/stores/user';

export const SettingsAccountSection = () => {
  const { t } = useTranslation(['defi', 'global']);
  const router = useRouter();
  const { currentAddress, wallet } = useDefiAccount();
  const accountName = useUserStore(state => state.account.account);

  const displayName = wallet?.name ?? accountName;

  return (
    <View>
      <Label className="text-muted mb-2">{t('defi:label.setting.current.account')}</Label>
      <ListGroup>
        <ListGroup.Item onPress={() => router.push('/settings/account')}>
          <ListGroup.ItemPrefix>
            <WalletAvatar className="bg-content2 h-10 w-10" wallet={wallet} />
          </ListGroup.ItemPrefix>
          <ListGroup.ItemContent>
            <ListGroup.ItemTitle>{displayName || t('defi:label.account')}</ListGroup.ItemTitle>
            {wallet?.isImport && currentAddress ? (
              <ListGroup.ItemDescription>
                {compactAddress(currentAddress)}
              </ListGroup.ItemDescription>
            ) : null}
          </ListGroup.ItemContent>
          <ListGroup.ItemSuffix />
        </ListGroup.Item>
        <ListGroup.Item onPress={() => router.push('/settings/language')}>
          <ListGroup.ItemContent>
            <ListGroup.ItemTitle>{t('global:label.language')}</ListGroup.ItemTitle>
          </ListGroup.ItemContent>
          <ListGroup.ItemSuffix />
        </ListGroup.Item>
        <ListGroup.Item onPress={() => router.push('/account/manage')}>
          <ListGroup.ItemContent>
            <ListGroup.ItemTitle>{t('defi:label.setting.manage.accounts')}</ListGroup.ItemTitle>
          </ListGroup.ItemContent>
          <ListGroup.ItemSuffix />
        </ListGroup.Item>
      </ListGroup>
    </View>
  );
};
