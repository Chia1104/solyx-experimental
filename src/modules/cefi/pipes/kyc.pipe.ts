import * as z from 'zod';

import { KYCDocumentType, KYCUploadContentType } from '../enums/kyc.enum';

export const KYCProfileDocumentItem = z.object({
  type: z.enum(KYCDocumentType),
  displayUrl: z.string(),
  mimeType: z.string(),
});

export type KYCProfileDocumentItem = z.infer<typeof KYCProfileDocumentItem>;

const coerceRejectionText = (value: unknown) => {
  if (typeof value === 'string') {
    const text = value.trim();
    return text || undefined;
  }

  if (Array.isArray(value)) {
    const parts = value
      .filter((item): item is string => typeof item === 'string')
      .map(item => item.trim())
      .filter(Boolean);

    return parts.length > 0 ? parts.join('\n') : undefined;
  }

  return undefined;
};

const firstRejectionValue = (...values: unknown[]) => {
  for (const value of values) {
    const text = coerceRejectionText(value);

    if (text) {
      return text;
    }
  }

  return undefined;
};

const KYCProfileData = z.object({
  fullName: z.string().optional(),
  gender: z.string().optional(),
  birthday: z.string().optional(),
  country: z.string().optional(),
  address: z.string().optional(),
  phoneCountryCode: z.string().optional(),
  phoneNumber: z.string().optional(),
  email: z.string().optional(),
  idType: z.string().optional(),
  documents: z.array(KYCProfileDocumentItem).optional(),
  status: z.string().optional(),
  verifiedAt: z.string().optional(),
  rejectedReason: z.string().optional(),
  plusRejectedReason: z.string().optional(),
  plusPassportName: z.string().optional(),
  plusPassportExpiryDate: z.string().optional(),
  plusDocuments: z.array(KYCProfileDocumentItem).optional(),
  plusStatus: z.string().optional(),
  plusVerifiedAt: z.string().optional(),
});

export const KYCProfile = z
  .looseObject({
    ...KYCProfileData.shape,
    rejected_reason: z.unknown().optional(),
    rejectReason: z.unknown().optional(),
    reject_reason: z.unknown().optional(),
    rejectionReason: z.unknown().optional(),
    rejection_reason: z.unknown().optional(),
    basicRejectedReason: z.unknown().optional(),
    basic_rejected_reason: z.unknown().optional(),
    plus_rejected_reason: z.unknown().optional(),
    plusRejectionReason: z.unknown().optional(),
    plus_rejection_reason: z.unknown().optional(),
  })
  .transform(profile => {
    const rejectedReason = firstRejectionValue(
      profile.rejectedReason,
      profile.rejected_reason,
      profile.rejectReason,
      profile.reject_reason,
      profile.rejectionReason,
      profile.rejection_reason,
      profile.basicRejectedReason,
      profile.basic_rejected_reason,
    );

    const plusRejectedReason = firstRejectionValue(
      profile.plusRejectedReason,
      profile.plus_rejected_reason,
      profile.plusRejectionReason,
      profile.plus_rejection_reason,
    );

    return {
      ...profile,
      ...(rejectedReason !== undefined ? { rejectedReason } : {}),
      ...(plusRejectedReason !== undefined ? { plusRejectedReason } : {}),
    };
  })
  .pipe(KYCProfileData);

export type KYCProfile = z.infer<typeof KYCProfile>;

export const KYCUploadURLRequest = z.object({
  contentType: z.enum(KYCUploadContentType),
  contentMd5: z.string(),
  limitSize: z.number(),
});

export type KYCUploadURLRequest = z.infer<typeof KYCUploadURLRequest>;

export const KYCUploadURL = z.object({
  path: z.string(),
  signedUrl: z.string(),
  headers: z.record(z.string(), z.string()),
});

export type KYCUploadURL = z.infer<typeof KYCUploadURL>;

export const KYCBasicDocuments = z.object({
  idFront: z.string(),
  idBack: z.string().optional(),
  selfie: z.string(),
});

export type KYCBasicDocuments = z.infer<typeof KYCBasicDocuments>;

export const KYCPlusDocuments = z.object({
  passport: z.string().optional(),
  transaction: z.string().optional(),
});

export type KYCPlusDocuments = z.infer<typeof KYCPlusDocuments>;

export const KYCProfileUpsertRequest = z.object({
  fullName: z.string().optional(),
  gender: z.string().optional(),
  birthday: z.string().optional(),
  country: z.string().optional(),
  address: z.string().optional(),
  phoneCountryCode: z.string().optional(),
  phoneNumber: z.string().optional(),
  email: z.string().optional(),
  idType: z.string().optional(),
  documents: KYCBasicDocuments.optional(),
  plusPassportName: z.string().optional(),
  plusDocuments: KYCPlusDocuments.optional(),
});

export type KYCProfileUpsertRequest = z.infer<typeof KYCProfileUpsertRequest>;

export const getKycLegalDisplayName = (data: Partial<KYCProfile> | undefined) => {
  if (!data) {
    return '';
  }

  const plus = typeof data.plusPassportName === 'string' ? data.plusPassportName.trim() : '';

  if (plus) {
    return plus;
  }

  const fullName = typeof data.fullName === 'string' ? data.fullName.trim() : '';

  if (fullName) {
    return fullName;
  }

  return '';
};

interface KycRejectionDisplayOptions {
  basicRejected: boolean;
  plusRejected: boolean;
}

export const getKycRejectionDisplayText = (
  profile: Partial<KYCProfile> | undefined,
  options: KycRejectionDisplayOptions,
) => {
  if (!profile) {
    return undefined;
  }

  const basicRejectedReason = profile.rejectedReason?.trim();
  const plusRejectedReason = profile.plusRejectedReason?.trim();
  const { basicRejected, plusRejected } = options;

  if (basicRejected && plusRejected) {
    const parts: string[] = [];

    if (basicRejectedReason) {
      parts.push(basicRejectedReason);
    }

    if (plusRejectedReason && plusRejectedReason !== basicRejectedReason) {
      parts.push(plusRejectedReason);
    }

    return parts.length > 0
      ? parts.join('\n\n')
      : basicRejectedReason || plusRejectedReason || undefined;
  }

  if (basicRejected) {
    return basicRejectedReason || plusRejectedReason || undefined;
  }

  if (plusRejected) {
    return plusRejectedReason || basicRejectedReason || undefined;
  }

  return undefined;
};
