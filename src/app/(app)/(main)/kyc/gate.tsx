import type { Href } from 'expo-router';
import { useRouter } from 'expo-router';
import { Button, Typography } from 'heroui-native';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { Page } from '@/components/page';
import { TabScreenScrollView } from '@/components/ui/tab-screen-scroll-view';
import { useQueryKYCProfile } from '@/modules/cefi/hooks/use-query-kyc-profile';

export default function WithdrawKycGateScreen() {
  const { t } = useTranslation(['defi']);
  const router = useRouter();
  const push = (href: string) => router.push(href as Href);
  const kycProfileQuery = useQueryKYCProfile();
  const status = kycProfileQuery.data?.status;
  const canWithdraw = status === 'PASS' || status === 'Verified';

  return (
    <Page.Stack>
      <TabScreenScrollView stackHeaderInset contentContainerClassName="gap-5 p-6 pb-8">
        <View className="bg-content1 rounded-3xl p-5">
          <Typography className="text-foreground" type="h2">
            {t('title.kyc.gate')}
          </Typography>
          <Typography className="text-foreground/60 mt-3">
            Current KYC status: {status ?? 'Not loaded'}. Complete verification before starting a
            withdrawal.
          </Typography>
        </View>

        <Button onPress={() => push(canWithdraw ? '/withdraw' : '/kyc/overview')} variant="primary">
          <Button.Label>{canWithdraw ? 'Continue to withdraw' : 'Review KYC'}</Button.Label>
        </Button>
      </TabScreenScrollView>
    </Page.Stack>
  );
}
