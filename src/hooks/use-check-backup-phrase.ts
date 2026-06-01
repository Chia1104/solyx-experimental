import { useCallback } from 'react';

import { useToast } from 'heroui-native';
import { useTranslation } from 'react-i18next';

import { useUserStore } from '@/modules/user/stores/user';

export function useCheckBackupPhrase() {
  const backupPhraseState = useUserStore(state => state.account.backupPhraseState);
  const { toast } = useToast();
  const { t } = useTranslation(['defi']);

  const checkBackupPhrase = useCallback(
    (content?: string) => {
      const hasBackup = backupPhraseState === 'done';

      if (!hasBackup) {
        toast.show({
          variant: 'warning',
          description: content ?? t('defi:description.back.up.to.use'),
        });
      }

      return hasBackup;
    },
    [backupPhraseState, t, toast],
  );

  return { checkBackupPhrase };
}
