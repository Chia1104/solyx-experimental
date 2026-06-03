import { BackupIntroContent } from '@/components/backup/backup-intro-screen';
import { Page } from '@/components/page';

export default function BackupIntro() {
  return (
    <Page brand className="px-6 py-12" edges="all">
      <BackupIntroContent phraseHref="/onboarding/backup-phrase" />
    </Page>
  );
}
