import { BackupPhraseContent } from '@/components/backup/backup-phrase-screen';
import { Page } from '@/components/page';

export default function BackupPhrase() {
  return (
    <Page brand className="px-6 py-12" edges="all">
      <BackupPhraseContent confirmHref="/onboarding/confirm-phrase" />
    </Page>
  );
}
