import { DefiPlaceholderScreen } from '@/modules/defi/components/defi-placeholder-screen';

export default function SendAmountScreen() {
  return (
    <DefiPlaceholderScreen
      actions={[
        {
          href: '/send/confirm',
          label: 'Review transaction',
        },
      ]}
      description="Enter the transfer amount, estimate gas through the active chain adapter, then pass a normalized transaction draft to confirmation."
      title="Send Amount"
    />
  );
}
