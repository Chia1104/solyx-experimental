import { DefiPlaceholderScreen } from '@/components/defi-placeholder-screen';

export default function WithdrawalDetailScreen() {
  return (
    <DefiPlaceholderScreen
      actions={[
        {
          href: '/withdraw/resubmit',
          label: 'Resubmit documents',
        },
      ]}
      description="Withdrawal detail route for status tracking, bank information, fee, and resubmission entry points."
      title="Withdrawal Detail"
    />
  );
}
