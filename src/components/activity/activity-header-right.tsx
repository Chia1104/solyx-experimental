import { LinkButton } from 'heroui-native';
import { useTranslation } from 'react-i18next';

import { FAQAction } from '../faq-action';

export const ActivityHeaderRight = () => {
  const { t } = useTranslation(['defi']);

  return (
    <FAQAction
      trigger={
        <LinkButton>
          <LinkButton.Label className="text-accent text-base font-bold">
            {t('label.setting.faq')}
          </LinkButton.Label>
        </LinkButton>
      }
    />
  );
};
