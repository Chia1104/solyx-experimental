import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Button, ScrollShadow } from 'heroui-native';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { AccountsList } from '@/components/account/accounts-list';
import { BackupPhraseNotice } from '@/components/account/backup-phrase-notice';
import { Page } from '@/components/page';
import { TabScreenScrollView } from '@/components/ui/tab-screen-scroll-view';

export default function ManageAccountsScreen() {
  const { t } = useTranslation(['defi']);
  const router = useRouter();

  return (
    <Page className="bg-background flex-1" edges={['left', 'right', 'bottom']}>
      <ScrollShadow LinearGradientComponent={LinearGradient} className="flex-1">
        <TabScreenScrollView stackHeaderInset contentContainerClassName="gap-4 pb-6">
          <BackupPhraseNotice root={{ className: 'rounded-none' }} />

          <View className="px-4">
            <AccountsList isSelectable={false} />
          </View>
        </TabScreenScrollView>
      </ScrollShadow>

      <View className="items-center px-6 py-4">
        <Button onPress={() => router.push('/account/add')} size="sm" variant="ghost">
          <Button.Label>{t('defi:action.add.an.account')}</Button.Label>
        </Button>
      </View>
    </Page>
  );
}
