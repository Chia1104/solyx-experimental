import { Chip } from 'heroui-native';
import { useTranslation } from 'react-i18next';

import { ThemedIcon } from '@/components/ui/themed-icon';
import { CefiKYCDisplayState } from '@/modules/cefi/enums/kyc.enum';

interface KYCStatusChipProps {
  displayState: CefiKYCDisplayState;
}

const chipColors: Record<CefiKYCDisplayState, 'default' | 'success' | 'danger'> = {
  [CefiKYCDisplayState.NotVerified]: 'default',
  [CefiKYCDisplayState.UnderReview]: 'default',
  [CefiKYCDisplayState.Verified]: 'success',
  [CefiKYCDisplayState.VerifiedPlus]: 'success',
  [CefiKYCDisplayState.Rejected]: 'danger',
};

export const KYCStatusChip = ({ displayState }: KYCStatusChipProps) => {
  const { t } = useTranslation(['defi']);
  const isVerified =
    displayState === CefiKYCDisplayState.Verified ||
    displayState === CefiKYCDisplayState.VerifiedPlus;

  return (
    <Chip color={chipColors[displayState]} variant="soft">
      {isVerified ? (
        <ThemedIcon className="text-success" name="checkmark-circle" size={14} />
      ) : null}
      <Chip.Label className="text-xs font-semibold">
        {t(`kyc.displayStatus.${displayState}`)}
      </Chip.Label>
    </Chip>
  );
};
