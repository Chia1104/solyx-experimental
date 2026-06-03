import { useTranslation } from 'react-i18next';

import { DefiPlaceholderContent } from '@/components/defi-placeholder-screen';
import { Page } from '@/components/page';

export default function BridgeOrdersScreen() {
  const { t } = useTranslation(['defi']);

  return (
    <Page.Stack>
      <DefiPlaceholderContent
        description="Bridge order history and pending order deep links. This should use bridge order queries before Activity merges cross-domain records."
        title={t('title.bridge.orders')}
      />
    </Page.Stack>
  );
}
