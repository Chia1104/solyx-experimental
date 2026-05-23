import type { Href } from 'expo-router';
import { useRouter } from 'expo-router';
import { Button, Text } from 'heroui-native';
import { ScrollView, View } from 'react-native';

import { Page } from '@/components/page';
import { useQueryKYCProfile } from '@/modules/cefi/hooks/use-query-kyc-profile';

export default function WithdrawKycGateScreen() {
  const router = useRouter();
  const push = (href: string) => router.push(href as Href);
  const kycProfileQuery = useQueryKYCProfile();
  const status = kycProfileQuery.data?.status;
  const canWithdraw = status === 'PASS' || status === 'Verified';

  return (
    <Page className="bg-background">
      <ScrollView contentContainerClassName="gap-5 p-6">
        <View className="bg-content1 rounded-3xl p-5">
          <Text className="text-foreground" type="h2">
            Withdrawal verification
          </Text>
          <Text className="text-foreground/60 mt-3">
            Current KYC status: {status ?? 'Not loaded'}. Complete verification before starting a
            withdrawal.
          </Text>
        </View>

        <Button onPress={() => push(canWithdraw ? '/withdraw' : '/kyc/overview')} variant="primary">
          <Button.Label>{canWithdraw ? 'Continue to withdraw' : 'Review KYC'}</Button.Label>
        </Button>
      </ScrollView>
    </Page>
  );
}
