import { useRouter } from 'expo-router';
import type { Href } from 'expo-router';
import { Button, Text } from 'heroui-native';
import { Pressable, ScrollView, View } from 'react-native';

import { Page } from '@/components/page';
import { ThemedIcon } from '@/components/ui/themed-icon';
import { useHomeAssets } from '@/modules/defi/hooks/use-home-assets';

const formatUsd = (value: { toNumber: () => number }) =>
  new Intl.NumberFormat('en-US', {
    currency: 'USD',
    maximumFractionDigits: 2,
    style: 'currency',
  }).format(value.toNumber());

export default function HomeScreen() {
  const router = useRouter();
  const {
    balanceRefreshTrigger,
    chain,
    currentAddress,
    isPricesLoading,
    pricesError,
    refreshBalances,
    rows,
    totalFiatValue,
    wallet,
  } = useHomeAssets();
  const push = (href: string) => router.push(href as Href);

  return (
    <Page className="bg-background">
      <ScrollView contentContainerClassName="gap-5 p-6">
        <View className="gap-2">
          <Text className="text-foreground/60" type="body">
            DeFi Wallet
          </Text>
          <Text className="text-foreground" type="h1">
            {formatUsd(totalFiatValue)}
          </Text>
          <Text className="text-foreground/60" type="body">
            {chain?.name ?? 'No chain selected'} · {wallet?.name ?? 'Current account'}
          </Text>
        </View>

        <View className="bg-content1 rounded-3xl p-4">
          <Text className="text-foreground/60" type="body">
            Active Address
          </Text>
          <Text className="text-foreground mt-1" numberOfLines={1}>
            {currentAddress || 'Create or import a wallet to start using DeFi.'}
          </Text>
        </View>

        <View className="flex-row gap-3">
          <QuickAction icon="arrow-up" label="Send" onPress={() => push('/send')} />
          <QuickAction icon="qr-code" label="Receive" onPress={() => push('/receive')} />
          <QuickAction icon="scan" label="Scan" onPress={() => push('/scanner')} />
          <QuickAction icon="card" label="Buy" onPress={() => push('/activity')} />
        </View>

        <View className="flex-row gap-3">
          <Button className="flex-1" onPress={refreshBalances} variant="primary">
            <Button.Label>Refresh balances</Button.Label>
          </Button>
          <Button className="flex-1" onPress={() => push('/kyc/gate')} variant="secondary">
            <Button.Label>Withdraw</Button.Label>
          </Button>
        </View>

        <View className="gap-3">
          <View className="flex-row items-center justify-between">
            <Text className="text-foreground" type="h3">
              Assets
            </Text>
            <Text className="text-foreground/50">
              {isPricesLoading
                ? 'Loading prices'
                : pricesError
                  ? 'Price unavailable'
                  : 'Live prices'}
            </Text>
          </View>

          {rows.length > 0 ? (
            rows.map(row => (
              <Pressable
                className="bg-content1 rounded-3xl p-4"
                key={`${row.symbol}:${row.address}`}
                onPress={() => push(`/assets/${row.symbol}`)}
              >
                <View className="flex-row items-center justify-between">
                  <View>
                    <Text className="text-foreground" weight="medium">
                      {row.symbol}
                    </Text>
                    <Text className="text-foreground/50" type="body">
                      {row.name}
                    </Text>
                  </View>
                  <View className="items-end">
                    <Text className="text-foreground" weight="medium">
                      {row.balance}
                    </Text>
                    <Text className="text-foreground/50" type="body">
                      {formatUsd(row.fiatValue)}
                    </Text>
                  </View>
                </View>
              </Pressable>
            ))
          ) : (
            <View className="bg-content1 rounded-3xl p-5">
              <Text className="text-foreground/60">
                Chain metadata is not ready yet. The Home screen is wired to the wallet store, price
                API, and chain adapter for the next balance sync pass.
              </Text>
            </View>
          )}
        </View>

        <Text className="text-foreground/40">
          Last balance refresh:{' '}
          {balanceRefreshTrigger ? new Date(balanceRefreshTrigger).toLocaleString() : 'Never'}
        </Text>
      </ScrollView>
    </Page>
  );
}

interface QuickActionProps {
  icon: React.ComponentProps<typeof ThemedIcon>['name'];
  label: string;
  onPress: () => void;
}

const QuickAction = ({ icon, label, onPress }: QuickActionProps) => (
  <Pressable className="bg-content1 flex-1 items-center gap-2 rounded-3xl p-4" onPress={onPress}>
    <View className="bg-accent/15 rounded-full p-3">
      <ThemedIcon className="text-accent" name={icon} size={20} />
    </View>
    <Text className="text-foreground" weight="medium">
      {label}
    </Text>
  </Pressable>
);
