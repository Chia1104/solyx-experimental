import { useTranslation } from 'react-i18next';

import { DefiPlaceholderContent } from '@/components/defi-placeholder-screen';
import { Page } from '@/components/page';

export default function ScannerScreen() {
  const { t } = useTranslation(['defi']);

  return (
    <Page.Stack>
      <DefiPlaceholderContent
        description="Camera scanner route for wallet addresses and payment payloads. Expo camera permissions and parsed address handoff should be added in the Send flow slice."
        title={t('title.scan.QR.Code')}
      />
    </Page.Stack>
  );
}
