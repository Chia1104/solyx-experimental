import { ConfirmPhraseContent } from '@/components/backup/confirm-phrase-screen';
import { Page } from '@/components/page';
import { useOnboardingSessionStore } from '@/modules/onboarding/stores/onboarding-session';

export default function AccountBackupConfirmPhraseScreen() {
  const resetOnboardingSession = useOnboardingSessionStore(state => state.resetOnboardingSession);

  return (
    <Page className="p-6" edges="all">
      <ConfirmPhraseContent completeHref="/account/manage" onComplete={resetOnboardingSession} />
    </Page>
  );
}
