import type { DialogRootProps } from 'heroui-native';
import { Button, Dialog } from 'heroui-native';
import { useTranslation } from 'react-i18next';

import { useAppStatus } from '@/components/app-status-context';

export const ServiceUnavailableDialog = (props: DialogRootProps) => {
  const { t } = useTranslation(['global']);
  const { refetch } = useAppStatus();
  return (
    <Dialog {...props}>
      <Dialog.Portal>
        <Dialog.Overlay />
        <Dialog.Content>
          <Dialog.Title>{t('notice.failed.title')}</Dialog.Title>
          <Dialog.Description>{t('notice.failed.description')}</Dialog.Description>
          <Button onPress={refetch} size="sm" variant="tertiary" className="mt-5">
            <Button.Label>{t('action.retry')}</Button.Label>
          </Button>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog>
  );
};
