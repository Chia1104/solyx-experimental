import * as z from 'zod';

import { CefiKYCStatus, CefiLocale, CefiPlusKYCStatus } from '../enums/users.enum';

export const CefiAccount = z.object({
  id: z.string(),
  type: z.string(),
  account: z.string(),
});

export type CefiAccount = z.infer<typeof CefiAccount>;

const UserData = z.object({
  id: z.string(),
  locale: z.string(),
  accounts: z.array(CefiAccount).default([]),
  isBoundSms: z.boolean(),
  isBoundEmail: z.boolean(),
  isBound2fa: z.boolean(),
  kycStatus: z.enum(CefiKYCStatus).default(CefiKYCStatus.New),
  plusKYCStatus: z.enum(CefiPlusKYCStatus).default(CefiPlusKYCStatus.New),
});

export const User = z
  .looseObject({
    ...UserData.shape,
    plusKycStatus: z.enum(CefiPlusKYCStatus).optional(),
  })
  .transform(user =>
    UserData.parse({
      ...user,
      plusKYCStatus: user.plusKYCStatus ?? user.plusKycStatus ?? CefiPlusKYCStatus.New,
    }),
  );

export type User = z.infer<typeof User>;

export const ChangeLocaleRequest = z.object({
  locale: z.enum(CefiLocale),
});

export type ChangeLocaleRequest = z.infer<typeof ChangeLocaleRequest>;
