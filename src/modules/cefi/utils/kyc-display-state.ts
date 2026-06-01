import { CefiKYCDisplayState } from '../enums/kyc.enum';
import { CefiKYCStatus, CefiPlusKYCStatus } from '../enums/users.enum';

export const getKYCDisplayState = (
  kycStatus: CefiKYCStatus,
  plusKycStatus: CefiPlusKYCStatus,
): CefiKYCDisplayState => {
  if (
    kycStatus === CefiKYCStatus.PendingVerify ||
    plusKycStatus === CefiPlusKYCStatus.PendingVerify
  ) {
    return CefiKYCDisplayState.UnderReview;
  }

  if (
    kycStatus === CefiKYCStatus.Fail ||
    kycStatus === CefiKYCStatus.Suspected ||
    plusKycStatus === CefiPlusKYCStatus.Fail ||
    plusKycStatus === CefiPlusKYCStatus.Suspected
  ) {
    return CefiKYCDisplayState.Rejected;
  }

  if (kycStatus === CefiKYCStatus.Pass && plusKycStatus === CefiPlusKYCStatus.Pass) {
    return CefiKYCDisplayState.VerifiedPlus;
  }

  if (kycStatus === CefiKYCStatus.Pass) {
    return CefiKYCDisplayState.Verified;
  }

  return CefiKYCDisplayState.NotVerified;
};
