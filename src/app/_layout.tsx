import '@/global.css';
import '@/libs/translations';
import * as Sentry from '@sentry/react-native';
import { Stack } from 'expo-router';

import { AppGuard, useAppGuard } from '@/components/app-guard';
import Brand from '@/components/brand';
import { MaintenanceDialog } from '@/components/fallback/maintenance-dialog';
import { NoNetworkDialog } from '@/components/fallback/no-network-dialog';
import { ServiceUnavailableDialog } from '@/components/fallback/service-unavailable-dialog';
import { UpdateRequiredDialog } from '@/components/fallback/update-required-dialog';
import { UpdateSuggestedDialog } from '@/components/fallback/update-suggested-dialog';
import { RootProvider } from '@/components/root-provider';
import { useStackScreenOptions } from '@/hooks/use-stack-screen-options';
import { AppStatus } from '@/modules/app/enums/app-status.enum';
import { globalInit } from '@/modules/app/utils';

globalInit();

const App = () => {
  const guard = useAppGuard();
  const screenOptions = useStackScreenOptions();

  return (
    <>
      <Stack screenOptions={screenOptions}>
        <Stack.Screen name="(app)" options={{ headerShown: false }} />
      </Stack>
      <MaintenanceDialog isOpen={guard.status === AppStatus.Maintenance} />
      <NoNetworkDialog isOpen={guard.status === AppStatus.NoNetwork} />
      <ServiceUnavailableDialog isOpen={guard.status === AppStatus.RequestFailed} />
      <UpdateRequiredDialog isOpen={guard.status === AppStatus.UpdateRequired} />
      <UpdateSuggestedDialog isOpen={guard.status === AppStatus.UpdateSuggested} />
    </>
  );
};

const RootLayout = () => {
  return (
    <RootProvider>
      <AppGuard fallback={<Brand />}>
        <App />
      </AppGuard>
    </RootProvider>
  );
};

export default Sentry.wrap(RootLayout);
