import { useAppStatus } from '@/components/app-status-context';
import { MaintenanceDialog } from '@/components/startup/maintenance-dialog';
import { NoNetworkDialog } from '@/components/startup/no-network-dialog';
import { ServiceUnavailableDialog } from '@/components/startup/service-unavailable-dialog';
import { UpdateRequiredDialog } from '@/components/startup/update-required-dialog';
import { UpdateSuggestedDialog } from '@/components/startup/update-suggested-dialog';
import { AppStatus } from '@/enums/app-status.enum';

const Startup = () => {
  const { status } = useAppStatus();

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
