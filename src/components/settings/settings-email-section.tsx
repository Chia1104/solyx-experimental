import { useRouter } from 'expo-router';
import { ListGroup } from 'heroui-native';
import { useTranslation } from 'react-i18next';

import { useUserStore } from '@/modules/user/stores/user';

export const SettingsEmailSection = () => {
  const { t } = useTranslation(['defi']);
  const router = useRouter();

  const isLoggedIn = useUserStore(state => state.cefiUserAccount.isLogin);
  const emailAccount = useUserStore(state =>
    state.cefiUserAccount.userData.accounts.find(account => account.type === 'email'),
  );

  if (!isLoggedIn) {
    return null;
  }

  return (
    <ListGroup>
      <ListGroup.Item onPress={() => router.push('/settings/email')}>
        <ListGroup.ItemContent>
          <ListGroup.ItemTitle>{t('kyc.email')}</ListGroup.ItemTitle>
          <ListGroup.ItemDescription>{emailAccount?.account}</ListGroup.ItemDescription>
        </ListGroup.ItemContent>
        <ListGroup.ItemSuffix />
      </ListGroup.Item>
    </ListGroup>
  );
};
