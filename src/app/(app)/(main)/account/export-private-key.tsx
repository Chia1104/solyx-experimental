import { DefiPlaceholderScreen } from '@/modules/defi/components/defi-placeholder-screen';

export default function ExportPrivateKeyScreen() {
  return (
    <DefiPlaceholderScreen
      description="Private key export route. It must require lock confirmation before revealing any secret material."
      title="Export Private Key"
    />
  );
}
