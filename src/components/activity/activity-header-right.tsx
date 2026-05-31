import { LinkButton } from 'heroui-native';
import { useTranslation } from 'react-i18next';

export const ActivityHeaderRight = () => {
  const { t } = useTranslation(['defi']);

  return (
    <LinkButton size="sm">
      <LinkButton.Label className="text-accent text-base font-bold">
        {t('label.setting.faq')}
      </LinkButton.Label>
    </LinkButton>
  );
};
