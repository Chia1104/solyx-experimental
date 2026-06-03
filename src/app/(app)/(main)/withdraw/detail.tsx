import { useTranslation } from 'react-i18next';

import { DefiPlaceholderContent } from '@/components/defi-placeholder-screen';
import { Page } from '@/components/page';

export default function WithdrawalDetailScreen() {
  const { t } = useTranslation(['defi']);

  return (
    <Page.Stack>
      <DefiPlaceholderContent
        actions={[
          {
            href: '/withdraw/resubmit',
            label: 'Resubmit documents',
          },
        ]}
        description="Withdrawal detail route for status tracking, bank information, fee, and resubmission entry points."
        title={t('title.withdraw.detail')}
      />
    </Page.Stack>
  );
}
