import { useTranslation } from 'react-i18next';

import { DefiPlaceholderContent } from '@/components/defi-placeholder-screen';
import { Page } from '@/components/page';

export default function KycOverviewScreen() {
  const { t } = useTranslation(['defi']);

  return (
    <Page.Stack>
      <DefiPlaceholderContent
        actions={[
          {
            href: '/kyc/verification',
            label: t('kyc.overview.startVerification'),
          },
        ]}
        description="KYC overview route for basic and plus verification state, rejection reasons, and document upload entry points."
        title={t('title.kyc.overview')}
      />
    </Page.Stack>
  );
}
