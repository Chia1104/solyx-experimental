import { ConfirmPhraseScreen } from '@/components/backup/confirm-phrase-screen';
import { useOnboardingSessionStore } from '@/modules/onboarding/stores/onboarding-session';

export default function AccountBackupConfirmPhraseScreen() {
  const resetOnboardingSession = useOnboardingSessionStore(state => state.resetOnboardingSession);

  return <ConfirmPhraseScreen completeHref="/account/manage" onComplete={resetOnboardingSession} />;
}
