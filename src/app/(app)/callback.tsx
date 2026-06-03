import { useMemo } from 'react';

import { useLocalSearchParams } from 'expo-router';
import { ActivityIndicator } from 'react-native';

import { Page } from '@/components/page';
import { useSsoCallback } from '@/modules/cefi/hooks/use-sso';

const getSingleParam = (value: string | string[] | undefined) => {
  if (Array.isArray(value)) return value[0] ?? '';
  return value ?? '';
};

export default function Callback() {
  const params = useLocalSearchParams();

  const callbackParams = useMemo(
    () => ({
      code: getSingleParam(params.code),
      event: getSingleParam(params.event),
      state: getSingleParam(params.state),
    }),
    [params.code, params.event, params.state],
  );

  useSsoCallback(callbackParams);

  return (
    <Page.Brand edges={['top', 'left', 'right']} className="items-center justify-center px-6">
      <ActivityIndicator />
    </Page.Brand>
  );
}
