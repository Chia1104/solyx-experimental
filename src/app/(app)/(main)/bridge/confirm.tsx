import { useTranslation } from 'react-i18next';

import { DefiPlaceholderContent } from '@/components/defi-placeholder-screen';
import { Page } from '@/components/page';

export default function BridgeConfirmScreen() {
  const { t } = useTranslation(['defi']);

  return (
    <Page.Stack>
      <DefiPlaceholderContent
        description="Confirm bridge quote, payment address, platform fee, expiration, and submit the fixed-rate order through the existing bridge mutations."
        title={t('title.bridge.confirm.order')}
      />
    </Page.Stack>
  );
}
