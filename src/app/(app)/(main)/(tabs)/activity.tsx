import { Text } from 'heroui-native';
import { ScrollView, View } from 'react-native';

import { Page } from '@/components/page';

export default function ActivityScreen() {
  // const { currentAddress, currentChainId } = useDefiAccount();
  // const records = useLiveQuery(
  //   getRecords({ userAddress: currentAddress, chainId: currentChainId }),
  // );

  // console.log(records);

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
