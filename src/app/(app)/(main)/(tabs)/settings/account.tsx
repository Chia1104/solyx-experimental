import { AccountManagementContent } from '@/components/account/account-management-content';
import { Page } from '@/components/page';
import { useDefiAccount } from '@/modules/defi/hooks/use-defi-account';

export default function SettingAccountScreen() {
  const { wallet } = useDefiAccount();

  return (
    <Page.Tab>
      <AccountManagementContent wallet={wallet} />
    </Page.Tab>
  );
}
