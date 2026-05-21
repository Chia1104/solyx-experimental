import { Text } from 'heroui-native';
import { ScrollView, View } from 'react-native';

import { Page } from '@/components/page';
import { useQueryAssets } from '@/modules/defi/hooks/use-query-assets';
import { useQueryTransactions } from '@/modules/defi/hooks/use-query-transactions';

export default function ActivityScreen() {
  const { chain, currentAddress } = useQueryAssets();
  const transactionsQuery = useQueryTransactions(
    {
      address: currentAddress,
      chainId: String(chain?.chainId ?? ''),
      page: 1,
      perPage: 20,
    },
    {
      enabled: Boolean(chain?.chainId && currentAddress),
    },
  );
  const transactions = transactionsQuery.data?.data ?? [];

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

        <View className="gap-3">
          {transactions.length > 0 ? (
            transactions.map(transaction => (
              <View className="bg-content1 rounded-3xl p-4" key={transaction.txId}>
                <View className="flex-row items-center justify-between">
                  <View className="flex-1 pr-3">
                    <Text className="text-foreground" weight="medium">
                      {transaction.symbol} · {transaction.status}
                    </Text>
                    <Text className="text-foreground/50" numberOfLines={1} type="body">
                      {transaction.txId}
                    </Text>
                  </View>
                  <Text className="text-foreground">{transaction.amount}</Text>
                </View>
              </View>
            ))
          ) : (
            <View className="bg-content1 rounded-3xl p-5">
              <Text className="text-foreground/60">
                {transactionsQuery.isLoading
                  ? 'Loading transaction history...'
                  : 'No transaction history for the current account yet.'}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </Page>
  );
}
