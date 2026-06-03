import { useTranslation } from 'react-i18next';

import { DefiPlaceholderContent } from '@/components/defi-placeholder-screen';
import { Page } from '@/components/page';

export default function WithdrawScreen() {
  const { t } = useTranslation(['defi']);

  return (
    <Page.Stack>
      <DefiPlaceholderContent
        actions={[
          {
            href: '/withdraw/detail',
            label: 'View withdrawal detail',
          },
        ]}
        description="Withdrawal form route. KYC gate should route here only after the profile is eligible for withdrawal."
        title={t('title.withdraw')}
      />
    </Page.Stack>
  );
}
