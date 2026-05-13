import { DefiPlaceholderScreen } from '@/modules/defi/components/defi-placeholder-screen';

export default function ImportPrivateKeyScreen() {
  return (
    <DefiPlaceholderScreen
      description="Private key import route. Validate chain-specific key formats before persisting through keychain mutations."
      title="Import Private Key"
    />
  );
}
