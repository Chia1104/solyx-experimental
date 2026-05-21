import { DefiPlaceholderScreen } from '@/components/defi-placeholder-screen';

export default function KycOverviewScreen() {
  return (
    <DefiPlaceholderScreen
      actions={[
        {
          href: '/kyc/verification',
          label: 'Start verification',
        },
      ]}
      description="KYC overview route for basic and plus verification state, rejection reasons, and document upload entry points."
      title="KYC Overview"
    />
  );
}
