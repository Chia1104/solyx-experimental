import { DefiPlaceholderScreen } from '@/components/defi-placeholder-screen';

export default function SendConfirmScreen() {
  return (
    <DefiPlaceholderScreen
      description="Confirm transaction details, sign with the chain adapter, broadcast the transaction, and call the existing transaction callback mutation."
      title="Confirm Send"
    />
  );
}
