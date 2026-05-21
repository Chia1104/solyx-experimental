import { DefiPlaceholderScreen } from '@/components/defi-placeholder-screen';

export default function ReceiveScreen() {
  return (
    <DefiPlaceholderScreen
      description="Display the current account address and QR code for the selected chain. Liquid receive address generation should use getLiquidReceiveAddresses before rendering."
      title="Receive"
    />
  );
}
