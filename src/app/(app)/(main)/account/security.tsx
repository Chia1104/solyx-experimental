import { useTranslation } from 'react-i18next';

import { DefiPlaceholderContent } from '@/components/defi-placeholder-screen';
import { Page } from '@/components/page';

export default function AccountSecurityScreen() {
  const { t } = useTranslation(['defi']);

  return (
    <Page.Stack>
      <DefiPlaceholderContent
        description="Security route for reset password verification, app lock changes, and password reset flows."
        title={t('title.security')}
      />
    </Page.Stack>
  );
}
