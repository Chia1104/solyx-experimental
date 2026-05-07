import * as z from 'zod';

export const PENDING_ONRAMP_ORDER_ID_KEY = 'pendingOnrampOrderId';

export const CreateOnrampOrderRequest = z.object({
  chainId: z.string(),
  destinationAddress: z.string(),
  purchaseCurrency: z.string(),
  redirectUrl: z.string(),
});

export type CreateOnrampOrderRequest = z.infer<typeof CreateOnrampOrderRequest>;

export const CreateOnrampOrder = z.object({
  orderId: z.string(),
  url: z.string(),
});

export type CreateOnrampOrder = z.infer<typeof CreateOnrampOrder>;

export const GetOnrampOrdersRequest = z.object({
  finPerPage: z.number().optional(),
  finPage: z.string().optional(),
});

export type GetOnrampOrdersRequest = z.infer<typeof GetOnrampOrdersRequest>;

export const OnrampOrderListItem = z.object({
  id: z.string(),
  provider: z.string(),
  chainId: z.string(),
  purchaseCurrency: z.string(),
  purchaseAmount: z.string(),
  status: z.string(),
  createdAt: z.string(),
});

export type OnrampOrderListItem = z.infer<typeof OnrampOrderListItem>;

export const OnrampOrdersMeta = z.object({
  totalRows: z.number(),
  totalPages: z.number(),
  currentPage: z.number(),
  perPage: z.number(),
});

export type OnrampOrdersMeta = z.infer<typeof OnrampOrdersMeta>;

export const OnrampOrders = z.array(OnrampOrderListItem);

export type OnrampOrders = z.infer<typeof OnrampOrders>;

export const GetOnrampOrderDetailRequest = z.object({
  orderId: z.string(),
  syncWithProvider: z.boolean().optional(),
});

export type GetOnrampOrderDetailRequest = z.infer<typeof GetOnrampOrderDetailRequest>;

export const OnrampOrderFees = z.object({
  currency: z.string(),
  value: z.string(),
});

export type OnrampOrderFees = z.infer<typeof OnrampOrderFees>;

export const OnrampOrderDetail = z.object({
  provider: z.string(),
  chainId: z.string(),
  destinationAddress: z.string(),
  purchaseCurrency: z.string(),
  purchaseAmount: z.string(),
  paymentMethod: z.string(),
  paymentCurrency: z.string(),
  paymentAmount: z.string(),
  fees: z.object({
    coinbase: OnrampOrderFees,
    network: OnrampOrderFees,
  }),
  txId: z.string(),
  status: z.string(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export type OnrampOrderDetail = z.infer<typeof OnrampOrderDetail>;
