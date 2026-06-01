import * as z from 'zod';

import { SupportedLocale, isSupportedLocale } from '@/modules/app/enums/supported-locale.enum';

import { CefiKYCStatus, CefiLocale, CefiPlusKYCStatus } from '../enums/users.enum';

export const GetAuthorizeUrlRequest = z.object({
  redirectUrl: z.string(),
});

export type GetAuthorizeUrlRequest = z.infer<typeof GetAuthorizeUrlRequest>;

export const AuthorizeUrl = z.object({
  redirectUrl: z.string(),
});

export type AuthorizeUrl = z.infer<typeof AuthorizeUrl>;

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

export const ChangeLocaleRequest = z
  .object({
    locale: z.enum(CefiLocale).or(z.enum(SupportedLocale)),
  })
  .transform(data => {
    let locale = data.locale;
    if (isSupportedLocale(data.locale)) {
      switch (data.locale) {
        case SupportedLocale.En:
          locale = CefiLocale.EnUs;
          break;
        case SupportedLocale.Tw:
          locale = CefiLocale.ZhTw;
          break;
        case SupportedLocale.Vn:
          locale = CefiLocale.ViVn;
          break;
        case SupportedLocale.Th:
          locale = CefiLocale.ThTh;
          break;
        case SupportedLocale.Cn:
          locale = CefiLocale.ZhCn;
          break;
      }
    }
    return {
      locale,
    };
  });

export type ChangeLocaleRequest = z.infer<typeof ChangeLocaleRequest>;
