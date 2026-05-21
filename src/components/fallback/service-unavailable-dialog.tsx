import type { DialogRootProps } from 'heroui-native';
import { Button, Dialog } from 'heroui-native';
import { useTranslation } from 'react-i18next';

import { useAppGuard } from '@/components/app-guard';

export const ServiceUnavailableDialog = (props: DialogRootProps) => {
  const { t } = useTranslation(['global']);
  const { refetch } = useAppGuard();
  return (
    <Dialog {...props}>
      <Dialog.Portal>
        <Dialog.Overlay />
        <Dialog.Content isSwipeable={false}>
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
