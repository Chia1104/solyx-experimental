export const KYCDocumentType = {
  IdFront: 'id_front',
  IdBack: 'id_back',
  Selfie: 'selfie',
  Passport: 'passport',
  Transaction: 'transaction',
} as const;

export type KYCDocumentType = (typeof KYCDocumentType)[keyof typeof KYCDocumentType];

export const KYCUploadContentType = {
  Jpeg: 'image/jpeg',
  Png: 'image/png',
  Gif: 'image/gif',
  Webp: 'image/webp',
  Pdf: 'application/pdf',
} as const;

export type KYCUploadContentType = (typeof KYCUploadContentType)[keyof typeof KYCUploadContentType];

export const CefiKYCDisplayState = {
  NotVerified: 'not_verified',
  UnderReview: 'under_review',
  Verified: 'verified',
  VerifiedPlus: 'verified_plus',
  Rejected: 'rejected',
} as const;

export type CefiKYCDisplayState = (typeof CefiKYCDisplayState)[keyof typeof CefiKYCDisplayState];
