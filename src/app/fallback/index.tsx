import { useAppGuard } from '@/components/app-guard';
import { MaintenanceDialog } from '@/components/fallback/maintenance-dialog';
import { NoNetworkDialog } from '@/components/fallback/no-network-dialog';
import { ServiceUnavailableDialog } from '@/components/fallback/service-unavailable-dialog';
import { UpdateRequiredDialog } from '@/components/fallback/update-required-dialog';
import { UpdateSuggestedDialog } from '@/components/fallback/update-suggested-dialog';
import { AppStatus } from '@/enums/app-status.enum';

const Startup = () => {
  const { status } = useAppGuard();

  return (
    <>
      <MaintenanceDialog isOpen={status === AppStatus.Maintenance} />
      <NoNetworkDialog isOpen={status === AppStatus.NoNetwork} />
      <ServiceUnavailableDialog isOpen={status === AppStatus.RequestFailed} />
      <UpdateRequiredDialog isOpen={status === AppStatus.UpdateRequired} />
      <UpdateSuggestedDialog isOpen={status === AppStatus.UpdateSuggested} />
    </>
  );
};

export default Startup;
