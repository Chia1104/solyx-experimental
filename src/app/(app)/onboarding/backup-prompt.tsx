import { useRouter } from 'expo-router';

import {
  BackupPromptScreen,
  useResetBackupPhraseQuery,
} from '@/components/backup/backup-prompt-screen';
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
    <BackupPromptScreen introHref="/onboarding/backup-intro" isBrandVisible onLater={handleLater} />
  );
}
