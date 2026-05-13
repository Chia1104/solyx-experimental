import { DefiPlaceholderScreen } from '@/modules/defi/components/defi-placeholder-screen';

export default function SendTokenScreen() {
  return (
    <DefiPlaceholderScreen
      actions={[
        {
          href: '/send/amount',
          label: 'Continue to amount',
        },
        {
          href: '/scanner',
          label: 'Scan address',
        },
      ]}
      description="Select a token and recipient address. This is the entry point for the Send flow previously handled by DefiSelectToken and DefiSendTo."
      title="Send"
    />
  );
}
