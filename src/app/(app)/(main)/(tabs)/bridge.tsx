import { useRouter } from 'expo-router';
import type { Href } from 'expo-router';
import { Button, Typography } from 'heroui-native';
import { View } from 'react-native';

import { Page } from '@/components/page';
import { TabScreenScrollView } from '@/components/ui/tab-screen-scroll-view';
import { useQueryBridgeSupportedChains } from '@/modules/defi/hooks/use-query-bridge-supported-chains';

export default function BridgeScreen() {
  const router = useRouter();
  const push = (href: string) => router.push(href as Href);
  const supportedChainsQuery = useQueryBridgeSupportedChains();
  const chains = supportedChainsQuery.data?.chains ?? [];

  return (
    <Page className="bg-background" tabBarInset>
      <TabScreenScrollView contentContainerClassName="gap-5 px-6 pt-6" tabBarAdditionalPadding={24}>
        <View>
          <Typography className="text-foreground" type="h1">
            Bridge
          </Typography>
          <Typography className="text-foreground/60 mt-2">
            Create cross-chain orders from the DeFi tab. The order form is staged here while the
            fixed-rate quote and confirmation flow are wired in.
          </Typography>
        </View>

        <View className="bg-content1 rounded-3xl p-5">
          <Typography className="text-foreground" type="h3">
            Supported routes
          </Typography>
          <View className="mt-4 gap-3">
            {chains.length > 0 ? (
              chains.map(chain => (
                <View className="bg-content2 rounded-2xl p-4" key={chain.chainId}>
                  <Typography className="text-foreground" weight="medium">
                    {chain.name}
                  </Typography>
                  <Typography className="text-foreground/50" type="body">
                    {chain.targetChains.length} target chain(s)
                  </Typography>
                </View>
              ))
            ) : (
              <Typography className="text-foreground/60">
                {supportedChainsQuery.isLoading
                  ? 'Loading bridge metadata...'
                  : 'Bridge metadata is not available yet.'}
              </Typography>
            )}
          </View>
        </View>

        <View className="flex-row gap-3">
          <Button className="flex-1" onPress={() => push('/bridge/confirm')} variant="primary">
            <Button.Label>Review order</Button.Label>
          </Button>
          <Button className="flex-1" onPress={() => push('/bridge/orders')} variant="secondary">
            <Button.Label>History</Button.Label>
          </Button>
        </View>
      </TabScreenScrollView>
    </Page>
  );
}
