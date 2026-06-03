import { useTranslation } from 'react-i18next';

import { DefiPlaceholderContent } from '@/components/defi-placeholder-screen';
import { Page } from '@/components/page';

export default function KycVerificationScreen() {
  const { t } = useTranslation(['defi']);

  return (
    <Page.Stack>
      <DefiPlaceholderContent
        description="KYC verification form route for profile fields, document uploads, bank data, and selfie/passport steps."
        title={t('title.kyc.verification')}
      />
    </Page.Stack>
  );
}
