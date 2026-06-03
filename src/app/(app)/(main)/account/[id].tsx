import { useLocalSearchParams } from 'expo-router';

import { AccountManagementContent } from '@/components/account/account-management-content';
import { Page } from '@/components/page';
import { useQueryWallets } from '@/modules/database/hooks/use-query-wallets';

export default function AccountDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: wallets = [] } = useQueryWallets();

  const wallet = wallets.find(w => w.id === id);

  return (
    <Page.Stack>
      <AccountManagementContent tabBarAdditionalPadding={0} wallet={wallet} />
    </Page.Stack>
  );
}
