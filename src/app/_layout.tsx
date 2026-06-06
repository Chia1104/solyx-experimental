import '@/global.css';
import '@/libs/translations';
import * as Sentry from '@sentry/react-native';
import type { ErrorBoundaryProps } from 'expo-router';

import { AppGuard } from '@/components/app-guard';
import Brand from '@/components/brand';
import { ExpoError } from '@/components/expo-error';
import { Root } from '@/components/root';
import { RootProvider } from '@/components/root-provider';
import { globalInit } from '@/modules/app/utils';

globalInit();

export function ErrorBoundary(props: ErrorBoundaryProps) {
  return <ExpoError {...props} />;
}

const RootLayout = () => {
  return (
    <RootProvider>
      <AppGuard fallback={<Brand />}>
        <Root />
      </AppGuard>
    </RootProvider>
  );
};

export default Sentry.wrap(RootLayout);
