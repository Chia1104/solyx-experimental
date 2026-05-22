import { Text } from 'heroui-native';
import { ScrollView, View } from 'react-native';

import { Page } from '@/components/page';
import { useLiveInfiniteQueryRecord } from '@/modules/database/hooks/use-live-infinite-query-record';
import { useDefiAccount } from '@/modules/defi/hooks/use-defi-account';

export default function ActivityScreen() {
  const { currentChainId, currentAddress } = useDefiAccount();

  const { data } = useLiveInfiniteQueryRecord({
    chainId: currentChainId.toString(),
    userAddress: currentAddress,
  });
  console.log(data);
  return (
    <Page className="bg-background">
      <ScrollView contentContainerClassName="gap-5 p-6">
        <View>
          <Text className="text-foreground" type="h1">
            Activity
          </Text>
          <Text className="text-foreground/60 mt-2">
            This slice uses the remote DeFi transactions API as the first display source. Drizzle
            and TanStack DB remain available for pending/local records in a later pass.
          </Text>
        </View>
      </ScrollView>
    </Page>
  );
}
