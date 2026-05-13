import { DefiPlaceholderScreen } from '@/modules/defi/components/defi-placeholder-screen';

export default function ScannerScreen() {
  return (
    <DefiPlaceholderScreen
      description="Camera scanner route for wallet addresses and payment payloads. Expo camera permissions and parsed address handoff should be added in the Send flow slice."
      title="Scanner"
    />
  );
}
