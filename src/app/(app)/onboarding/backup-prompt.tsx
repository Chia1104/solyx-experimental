import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { Button, Typography } from 'heroui-native';
import { useTranslation } from 'react-i18next';
import { ScrollView, View } from 'react-native';

import { Page } from '@/components/page';
import { ThemedMaterialDesignIcon } from '@/components/ui/themed-icon';
import { useLockRequest } from '@/modules/app/hooks/use-lock-request';
import { queryOnboardingBackupPhraseOptions } from '@/modules/onboarding/hooks/use-query-onboarding-backup-phrase';
import { useOnboardingSessionStore } from '@/modules/onboarding/stores/onboarding-session';
import { useUserStore } from '@/modules/user/stores/user';

export default function BackupPrompt() {
  const { t } = useTranslation(['defi', 'global']);
  const router = useRouter();
  const queryClient = useQueryClient();
  const { requestPassword } = useLockRequest();
  const setAppLockPassword = useOnboardingSessionStore(state => state.setAppLockPassword);
  const resetOnboardingSession = useOnboardingSessionStore(state => state.resetOnboardingSession);
  const setBackupPhraseState = useUserStore(state => state.setBackupPhraseState);

  const handleGoBackup = async () => {
    const password = await requestPassword({
      isDismissible: false,
      reason: t('global:description.input.password.to.process'),
    });

    setAppLockPassword(password);
    router.push('/onboarding/backup-intro');
  };

  const handleLater = () => {
    queryClient.removeQueries(queryOnboardingBackupPhraseOptions(null));
    resetOnboardingSession();
    setBackupPhraseState('later');
    router.replace('/onboarding/done');
  };

  return (
    <Page isBrandVisible className="px-10 py-12" edges="all">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1 items-center justify-center">
          <Typography className="text-center text-3xl font-semibold" type="h3">
            {t('defi:title.back.up.seed.phrase')}
          </Typography>

          <ThemedMaterialDesignIcon name="wallet" size={48} className="text-accent mt-12" />

          <Typography className="text-muted mt-6 text-center" type="body">
            {t('defi:description.phraseBackup.back.up.seed.phrase')}
          </Typography>

          <Typography className="mt-12 text-center" type="body" weight="semibold">
            {t('defi:notice.back.up.now')}
          </Typography>

          <View className="mt-12 w-full max-w-72 gap-4">
            <Button onPress={() => void handleGoBackup()} size="sm">
              <Button.Label>{t('defi:action.go.back.up')}</Button.Label>
            </Button>
            <Button onPress={handleLater} variant="outline" size="sm">
              <Button.Label>{t('defi:action.later')}</Button.Label>
            </Button>
          </View>
        </View>
      </ScrollView>
    </Page>
  );
}
