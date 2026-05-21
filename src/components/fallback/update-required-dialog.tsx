import type { DialogRootProps } from 'heroui-native';
import { Dialog } from 'heroui-native';
import { useTranslation } from 'react-i18next';

export const UpdateRequiredDialog = (props: DialogRootProps) => {
  const { t } = useTranslation(['global']);
  return (
    <Dialog {...props}>
      <Dialog.Portal>
        <Dialog.Overlay />
        <Dialog.Content isSwipeable={false}>
          <Dialog.Title>{t('notice.force.update.title')}</Dialog.Title>
          <Dialog.Description>{t('notice.force.update.description')}</Dialog.Description>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog>
  );
};
