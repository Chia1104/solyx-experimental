import '@/global.css';
import '@/libs/translations';
import { Stack } from 'expo-router';

import { AppGuard } from '@/components/app-guard';
import Brand from '@/components/brand';
import { MaintenanceDialog } from '@/components/fallback/maintenance-dialog';
import { NoNetworkDialog } from '@/components/fallback/no-network-dialog';
import { ServiceUnavailableDialog } from '@/components/fallback/service-unavailable-dialog';
import { UpdateRequiredDialog } from '@/components/fallback/update-required-dialog';
import { UpdateSuggestedDialog } from '@/components/fallback/update-suggested-dialog';
import { RootProvider } from '@/components/root-provider';
import { AppStatus } from '@/modules/app/enums/app-status.enum';
import { globalInit } from '@/modules/app/utils';

globalInit();

export default function RootLayout() {
  return (
    <RootProvider>
      <AppGuard fallback={<Brand />}>
        {data => (
          <>
            <Stack>
              <Stack.Screen name="(app)" options={{ headerShown: false }} />
            </Stack>
            <MaintenanceDialog isOpen={data.status === AppStatus.Maintenance} />
            <NoNetworkDialog isOpen={data.status === AppStatus.NoNetwork} />
            <ServiceUnavailableDialog isOpen={data.status === AppStatus.RequestFailed} />
            <UpdateRequiredDialog isOpen={data.status === AppStatus.UpdateRequired} />
            <UpdateSuggestedDialog isOpen={data.status === AppStatus.UpdateSuggested} />
          </>
        )}
      </AppGuard>
    </RootProvider>
  );
}
