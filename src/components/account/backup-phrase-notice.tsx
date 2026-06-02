import { useRouter } from 'expo-router';
import type { AlertContentProps, AlertDescriptionProps, AlertRootProps } from 'heroui-native';
import { Alert, Button } from 'heroui-native';
import { useTranslation } from 'react-i18next';

import { useUserStore } from '@/modules/user/stores/user';

import { ThemedIcon } from '../ui/themed-icon';

interface Props {
  root?: AlertRootProps;
  content?: AlertContentProps;
  description?: AlertDescriptionProps;
}

export const BackupPhraseNotice = (props: Props) => {
  const { t } = useTranslation(['defi']);
  const router = useRouter();
  const backupPhraseState = useUserStore(state => state.account.backupPhraseState);

  if (backupPhraseState === 'done') {
    return null;
  }

  return (
    <Alert status="warning" {...props.root}>
      <Alert.Indicator />
      <Alert.Content {...props.content}>
        <Alert.Description {...props.description}>
          {t('defi:action.click.to.back.up')}
        </Alert.Description>
      </Alert.Content>
      <Button
        onPress={() => router.push('/account/backup-intro')}
        isIconOnly
        size="sm"
        variant="ghost"
      >
        <ThemedIcon name="chevron-forward" size={18} className="text-foreground/50" />
      </Button>
    </Alert>
  );
};
