import { useTranslation } from 'react-i18next';

import { DefiPlaceholderContent } from '@/components/defi-placeholder-screen';
import { Page } from '@/components/page';

export default function ReceiveScreen() {
  const { t } = useTranslation(['defi']);

  return (
    <Page.Stack>
      <DefiPlaceholderContent
        description="Display the current account address and QR code for the selected chain. Liquid receive address generation should use getLiquidReceiveAddresses before rendering."
        title={t('title.receive')}
      />
    </Page.Stack>
  );
}
