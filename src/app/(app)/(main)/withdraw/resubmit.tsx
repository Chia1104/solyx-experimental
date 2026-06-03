import { useTranslation } from 'react-i18next';

import { DefiPlaceholderContent } from '@/components/defi-placeholder-screen';
import { Page } from '@/components/page';

export default function WithdrawalResubmitScreen() {
  const { t } = useTranslation(['defi']);

  return (
    <Page.Stack>
      <DefiPlaceholderContent
        description="Resubmission route for failed or incomplete withdrawal records. The existing resubmit withdrawal mutation is the intended integration point."
        title={t('title.withdraw.resubmit')}
      />
    </Page.Stack>
  );
}
