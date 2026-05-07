export const CefiLocale = {
  ZhTw: 'zh_tw',
  EnUs: 'en_us',
  ViVn: 'vi_vn',
  ThTh: 'th_th',
  ZhCn: 'zh_cn',
} as const;

export type CefiLocale = (typeof CefiLocale)[keyof typeof CefiLocale];

export const CefiKYCStatus = {
  New: 'NEW',
  PendingVerify: 'PENDING_VERIFY',
  Pass: 'PASS',
  Fail: 'FAIL',
  Suspected: 'SUSPECTED',
} as const;

export type CefiKYCStatus = (typeof CefiKYCStatus)[keyof typeof CefiKYCStatus];

export const CefiPlusKYCStatus = {
  ...CefiKYCStatus,
  NotSubmitted: 'NOT_SUBMITTED',
} as const;

export type CefiPlusKYCStatus = (typeof CefiPlusKYCStatus)[keyof typeof CefiPlusKYCStatus];
