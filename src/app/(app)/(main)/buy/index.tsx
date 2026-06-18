import { BuyScreenContent } from '@/components/buy/buy-screen-content';
import { Page } from '@/components/page';
import { withNetworkGuard } from '@/hocs/with-network-guard';

const GuardedBuyContent = withNetworkGuard(BuyScreenContent);

export default function BuyIndexScreen() {
  return (
    <Page.Stack>
      <GuardedBuyContent />
    </Page.Stack>
  );
}
