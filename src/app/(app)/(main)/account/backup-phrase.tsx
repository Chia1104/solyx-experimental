import { BackupPhraseContent } from '@/components/backup/backup-phrase-screen';
import { Page } from '@/components/page';

export default function AccountBackupPhraseScreen() {
  return (
    <Page className="p-6" edges="all">
      <BackupPhraseContent confirmHref="/account/backup-confirm-phrase" />
    </Page>
  );
}
