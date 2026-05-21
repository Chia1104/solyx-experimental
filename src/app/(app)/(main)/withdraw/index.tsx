import { DefiPlaceholderScreen } from '@/components/defi-placeholder-screen';

export default function WithdrawScreen() {
  return (
    <DefiPlaceholderScreen
      actions={[
        {
          href: '/withdraw/detail',
          label: 'View withdrawal detail',
        },
      ]}
      description="Withdrawal form route. KYC gate should route here only after the profile is eligible for withdrawal."
      title="Withdraw"
    />
  );
}
