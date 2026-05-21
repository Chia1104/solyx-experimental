import type { DialogRootProps } from 'heroui-native';
import { Dialog } from 'heroui-native';
import { useTranslation } from 'react-i18next';

export const MaintenanceDialog = (props: DialogRootProps) => {
  const { t } = useTranslation(['global']);
  return (
    <Dialog {...props}>
      <Dialog.Portal>
        <Dialog.Overlay />
        <Dialog.Content isSwipeable={false}>
          <Dialog.Title>{t('notice.maintenance.title')}</Dialog.Title>
          <Dialog.Description>{t('notice.maintenance.description')}</Dialog.Description>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog>
  );
};
