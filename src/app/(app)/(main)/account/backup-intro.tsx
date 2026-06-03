import { BackupIntroContent } from '@/components/backup/backup-intro-screen';
import { Page } from '@/components/page';

export default function AccountBackupIntroScreen() {
  return (
    <Page className="p-6" edges="all">
      <BackupIntroContent phraseHref="/account/backup-phrase" unlockBeforeNext />
    </Page>
  );
}
