import { Stack } from 'expo-router';

import { useStackScreenOptions } from '@/hooks/use-stack-screen-options';
import { AppStatus } from '@/modules/app/enums/app-status.enum';

import { useAppGuard } from './app-guard';
import { MaintenanceDialog } from './fallback/maintenance-dialog';
import { NoNetworkDialog } from './fallback/no-network-dialog';
import { ServiceUnavailableDialog } from './fallback/service-unavailable-dialog';
import { UpdateRequiredDialog } from './fallback/update-required-dialog';
import { UpdateSuggestedDialog } from './fallback/update-suggested-dialog';

export const Root = () => {
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
