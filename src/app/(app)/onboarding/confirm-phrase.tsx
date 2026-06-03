import { ConfirmPhraseContent } from '@/components/backup/confirm-phrase-screen';
import { Page } from '@/components/page';

export default function ConfirmPhrase() {
  return (
    <Page brand className="px-6 py-12" edges="all">
      <ConfirmPhraseContent completeHref="/onboarding/done" />
    </Page>
  );
}
