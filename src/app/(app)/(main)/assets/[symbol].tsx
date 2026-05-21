import { useLocalSearchParams } from 'expo-router';

import { DefiPlaceholderScreen } from '@/components/defi-placeholder-screen';

export default function AssetDetailScreen() {
  const { symbol } = useLocalSearchParams<{ symbol: string }>();

  return (
    <DefiPlaceholderScreen
      actions={[
        {
          href: '/send',
          label: `Send ${symbol ?? 'token'}`,
        },
        {
          href: '/receive',
          label: 'Receive',
        },
      ]}
      description="Asset detail route for token-specific balances, price movement, and transaction shortcuts."
      title={`${symbol ?? 'Asset'} Detail`}
    />
  );
}
