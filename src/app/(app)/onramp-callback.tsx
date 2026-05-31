import { Redirect } from 'expo-router';

import { buildOnrampActivityHref } from '@/modules/cefi/utils/onramp';

export default function OnrampCallbackScreen() {
  return <Redirect href={buildOnrampActivityHref()} />;
}
