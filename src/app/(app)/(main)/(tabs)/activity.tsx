import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import { Typography } from 'heroui-native';
import { ScrollView, View } from 'react-native';

import { Page } from '@/components/page';
import { getRecords } from '@/modules/database/repos/defi-record.repo';
import { useDefiAccount } from '@/modules/defi/hooks/use-defi-account';

export default function ActivityScreen() {
  const { currentAddress, currentChainId } = useDefiAccount();
  const records = useLiveQuery(
    getRecords({ userAddress: currentAddress, chainId: currentChainId.toString() }),
  );

  console.log(records);

  return (
    <Page className="bg-background">
      <ScrollView contentContainerClassName="gap-5 p-6">
        <View>
          <Typography className="text-foreground" type="h1">
            Activity
          </Typography>
          <Typography className="text-foreground/60 mt-2">
            This slice uses the remote DeFi transactions API as the first display source. Drizzle
            and TanStack DB remain available for pending/local records in a later pass.
          </Typography>
        </View>
      </ScrollView>
    </Page>
  );
}
