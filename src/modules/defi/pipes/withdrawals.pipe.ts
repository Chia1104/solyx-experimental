import * as z from 'zod';

import { SupportedChainID } from '@/modules/chain/enums/supported-chain.enum';

export const DefiWithdrawalPairMeta = z.object({
  minAmount: z.number(),
  maxAmount: z.number(),
  serviceFeeRate: z.number(),
  bankFee: z.number(),
});

export type DefiWithdrawalPairMeta = z.infer<typeof DefiWithdrawalPairMeta>;

export const DefiWithdrawalsMeta = z.record(
  z.string(),
  z.record(z.string(), DefiWithdrawalPairMeta),
);

export type DefiWithdrawalsMeta = z.infer<typeof DefiWithdrawalsMeta>;

export const DefiWithdrawalEstimateFeeRequest = z.object({
  fromChainId: z.string(),
  fromAmount: z.number(),
  fromSymbol: z.string(),
  toCurrency: z.string(),
});

export type DefiWithdrawalEstimateFeeRequest = z.infer<typeof DefiWithdrawalEstimateFeeRequest>;

export const DefiWithdrawalEstimateFee = z.object({
  toAmount: z.number(),
  toCurrency: z.string(),
  serviceFee: z.number(),
  bankFee: z.number(),
  totalAmount: z.number(),
});

export type DefiWithdrawalEstimateFee = z.infer<typeof DefiWithdrawalEstimateFee>;

export const DefiWithdrawalBankInfo = z.object({
  bankCode: z.string(),
  bankName: z.string(),
  swiftCode: z.string(),
  branchCode: z.string(),
  accountName: z.string(),
  bankAddress: z.string(),
  accountNumber: z.string(),
  beneficiaryAddress: z.string(),
});

export type DefiWithdrawalBankInfo = z.infer<typeof DefiWithdrawalBankInfo>;

export const DefiWithdrawalCreateRequest = z.object({
  fromChainId: z.string(),
  fromSymbol: z.string(),
  fromAmount: z.number(),
  fromAddress: z.string().optional(),
  fromTxId: z.string().optional(),
  toCurrency: z.string(),
  bankAccountInfo: DefiWithdrawalBankInfo,
  isSaveBankInfo: z.boolean(),
  refundAddress: z.string(),
});

export type DefiWithdrawalCreateRequest = z.infer<typeof DefiWithdrawalCreateRequest>;

export const DefiWithdrawalChainRef = z.object({
  id: z.enum(SupportedChainID),
  name: z.string(),
});

export type DefiWithdrawalChainRef = z.infer<typeof DefiWithdrawalChainRef>;

export const DefiWithdrawalDetail = z.object({
  id: z.string(),
  orderNo: z.string().optional(),
  fromChain: DefiWithdrawalChainRef,
  fromSymbol: z.string(),
  fromAddress: z.string(),
  fromTxId: z.string().optional(),
  toCurrency: z.string(),
  receivingAddress: z.string(),
  fromAmount: z.string(),
  toAmount: z.string(),
  totalAmount: z.string(),
  serviceFee: z.string(),
  bankFee: z.string(),
  status: z.string(),
  completedAt: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  bankAccountInfo: DefiWithdrawalBankInfo,
  refundTxId: z.string().optional(),
  refundAmount: z.string().optional(),
});

export type DefiWithdrawalDetail = z.infer<typeof DefiWithdrawalDetail>;

export const GetDefiWithdrawalDetailRequest = z.object({
  id: z.string(),
});

export type GetDefiWithdrawalDetailRequest = z.infer<typeof GetDefiWithdrawalDetailRequest>;

export const DefiWithdrawalsListMeta = z.object({
  totalRows: z.number(),
  totalPages: z.number(),
  currentPage: z.number(),
  perPage: z.number(),
});

export type DefiWithdrawalsListMeta = z.infer<typeof DefiWithdrawalsListMeta>;

const normalizeListMeta = (raw: unknown, fallbackPerPage: number): DefiWithdrawalsListMeta => {
  if (!raw || typeof raw !== 'object') {
    return {
      totalRows: 0,
      totalPages: 1,
      currentPage: 1,
      perPage: fallbackPerPage,
    };
  }

  const meta = raw as Record<string, unknown>;

  return {
    totalRows: Number(meta.totalRows ?? meta.total_rows ?? 0),
    totalPages: Math.max(1, Number(meta.totalPages ?? meta.total_pages ?? meta.last_page ?? 1)),
    currentPage: Math.max(1, Number(meta.currentPage ?? meta.current_page ?? 1)),
    perPage: Math.max(1, Number(meta.perPage ?? meta.per_page ?? fallbackPerPage)),
  };
};

export const DefiWithdrawalListItem = z.object({
  id: z.string(),
  fromChain: DefiWithdrawalChainRef,
  fromSymbol: z.string(),
  totalAmount: z.string(),
  status: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type DefiWithdrawalListItem = z.infer<typeof DefiWithdrawalListItem>;

export const GetDefiWithdrawalsListRequest = z.object({
  page: z.number().optional(),
  perPage: z.number().optional(),
  fromChainId: z.string().optional(),
});

export type GetDefiWithdrawalsListRequest = z.infer<typeof GetDefiWithdrawalsListRequest>;

export const createDefiWithdrawalsListResponse = (fallbackPerPage: number) =>
  z
    .looseObject({
      data: z.unknown().optional(),
      meta: z.unknown().optional(),
    })
    .transform(raw => {
      let rows: unknown[] = [];
      let metaRaw = raw.meta;

      if (Array.isArray(raw.data)) {
        rows = raw.data;
      } else if (raw.data && typeof raw.data === 'object') {
        const data = raw.data as Record<string, unknown>;

        if (Array.isArray(data.data)) {
          rows = data.data;
          metaRaw = data.meta ?? raw.meta;
        } else if (Array.isArray(data.items)) {
          rows = data.items;
          metaRaw = data.meta ?? raw.meta;
        }
      }

      return {
        data: z.array(DefiWithdrawalListItem).parse(rows),
        meta: normalizeListMeta(metaRaw, fallbackPerPage),
      };
    });

export type DefiWithdrawalsListResponse = z.infer<
  ReturnType<typeof createDefiWithdrawalsListResponse>
>;

export const UpdateDefiWithdrawalRequestBody = z.object({
  status: z.string(),
  fromAddress: z.string(),
  fromTxId: z.string(),
});

export type UpdateDefiWithdrawalRequestBody = z.infer<typeof UpdateDefiWithdrawalRequestBody>;

export const UpdateDefiWithdrawalRequest = z.object({
  id: z.string(),
  body: UpdateDefiWithdrawalRequestBody,
});

export type UpdateDefiWithdrawalRequest = z.infer<typeof UpdateDefiWithdrawalRequest>;

export const ResubmitDefiWithdrawalRequestBody = z.object({
  message: z.string(),
  attachmentPaths: z.array(z.string()),
});

export type ResubmitDefiWithdrawalRequestBody = z.infer<typeof ResubmitDefiWithdrawalRequestBody>;

export const ResubmitDefiWithdrawalRequest = z.object({
  id: z.string(),
  body: ResubmitDefiWithdrawalRequestBody,
});

export type ResubmitDefiWithdrawalRequest = z.infer<typeof ResubmitDefiWithdrawalRequest>;

export const DefiWithdrawalEventAttachment = z.object({
  originalName: z.string().nullable().optional(),
  mimeType: z.string(),
  fileSize: z.number(),
  url: z.string(),
  createdAt: z.string(),
});

export type DefiWithdrawalEventAttachment = z.infer<typeof DefiWithdrawalEventAttachment>;

export const DefiWithdrawalEvent = z.object({
  fromStatus: z.string().nullable(),
  toStatus: z.string(),
  message: z.string().nullable(),
  causerType: z.string(),
  attachments: z.array(DefiWithdrawalEventAttachment),
  createdAt: z.string(),
});

export type DefiWithdrawalEvent = z.infer<typeof DefiWithdrawalEvent>;

export const GetDefiWithdrawalEventsRequest = z.object({
  id: z.string(),
  page: z.number().optional(),
  perPage: z.number().optional(),
});

export type GetDefiWithdrawalEventsRequest = z.infer<typeof GetDefiWithdrawalEventsRequest>;

export const DefiWithdrawalEventsResponse = z
  .looseObject({
    data: z.unknown().optional(),
    meta: DefiWithdrawalsListMeta.optional(),
  })
  .transform(raw => {
    if (Array.isArray(raw.data)) {
      return {
        data: z.array(DefiWithdrawalEvent).parse(raw.data),
        meta: raw.meta,
      };
    }

    if (raw.data && typeof raw.data === 'object') {
      return {
        data: [DefiWithdrawalEvent.parse(raw.data)],
        meta: raw.meta,
      };
    }

    return {
      data: [],
      meta: raw.meta,
    };
  });

export type DefiWithdrawalEventsResponse = z.infer<typeof DefiWithdrawalEventsResponse>;
