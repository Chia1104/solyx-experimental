import { DefiPlaceholderScreen } from '@/modules/defi/components/defi-placeholder-screen';

export default function ManageAccountsScreen() {
  return (
    <DefiPlaceholderScreen
      actions={[
        {
          href: '/account/add',
          label: 'Add account',
        },
        {
          href: '/account/import-private-key',
          label: 'Import private key',
        },
        {
          href: '/account/export-private-key',
          label: 'Export private key',
        },
      ]}
      description="Wallet account management route for switching accounts, editing names, and private key operations."
      title="Manage Accounts"
    />
  );
}
