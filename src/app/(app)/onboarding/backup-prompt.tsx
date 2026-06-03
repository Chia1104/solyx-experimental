import { useRouter } from 'expo-router';

import {
  BackupPromptContent,
  useResetBackupPhraseQuery,
} from '@/components/backup/backup-prompt-screen';
import { Page } from '@/components/page';
import { useOnboardingSessionStore } from '@/modules/onboarding/stores/onboarding-session';
import { useUserStore } from '@/modules/user/stores/user';

export default function BackupPrompt() {
  const router = useRouter();
  const resetBackupPhraseQuery = useResetBackupPhraseQuery();
  const resetOnboardingSession = useOnboardingSessionStore(state => state.resetOnboardingSession);
  const setBackupPhraseState = useUserStore(state => state.setBackupPhraseState);

  const handleLater = () => {
    resetBackupPhraseQuery();
    resetOnboardingSession();
    setBackupPhraseState('later');
    router.replace('/onboarding/done');
  };

  return (
    <Page brand className="px-10 py-12" edges="all">
      <BackupPromptContent introHref="/onboarding/backup-intro" onLater={handleLater} />
    </Page>
  );
}
