import * as z from 'zod';

import { SupportedChainID } from '@/modules/chain/enums/supported-chain.enum';
import { fromBridgeApiChainId, toBridgeApiChainId } from '@/modules/chain/utils';

import { BridgeOrderStatus } from '../enums/bridges.enum';

export const BridgeChainInfo = z
  .object({
    id: z.enum(SupportedChainID),
    name: z.string(),
  })
  .transform(chain => ({
    ...chain,
    id: fromBridgeApiChainId(chain.id),
  }));

export type BridgeChainInfo = z.infer<typeof BridgeChainInfo>;

export const BridgeOrderMetadata = z.object({
  sendTxHash: z.string(),
  receiveTxHash: z.string(),
  paymentTargetAddress: z.string(),
  expiresAt: z.string(),
  payments: z.object({
    gasFee: z.string(),
    madeAt: z.string(),
    txHash: z.string(),
  }),
});

export type BridgeOrderMetadata = z.infer<typeof BridgeOrderMetadata>;

export const BridgeOrder = z.object({
  id: z.string(),
  bridgeOrderId: z.string(),
  fromChain: BridgeChainInfo,
  fromToken: z.string(),
  fromAddress: z.string(),
  toChain: BridgeChainInfo,
  toToken: z.string(),
  toAddress: z.string(),
  amount: z.string(),
  receivedAmount: z.string(),
  platformFee: z.string(),
  status: z.enum(BridgeOrderStatus),
  createdAt: z.string(),
  completedAt: z.string(),
  metadata: BridgeOrderMetadata,
});

export type BridgeOrder = z.infer<typeof BridgeOrder>;

export const BridgeOrdersMeta = z.object({
  totalRows: z.number(),
  totalPages: z.number(),
  currentPage: z.number(),
  perPage: z.number(),
});

export type BridgeOrdersMeta = z.infer<typeof BridgeOrdersMeta>;

export const GetBridgeOrdersRequest = z.object({
  statuses: z.array(z.enum(BridgeOrderStatus)).optional(),
  finPerPage: z.string().or(z.number()).optional(),
  finPage: z.string().or(z.number()).optional(),
});

export type GetBridgeOrdersRequest = z.infer<typeof GetBridgeOrdersRequest>;

export const BridgeOrderListItem = z.object({
  id: z.string(),
  fromChain: BridgeChainInfo,
  fromToken: z.string(),
  toChain: BridgeChainInfo,
  toToken: z.string(),
  amount: z.string(),
  status: z.enum(BridgeOrderStatus),
  createdAt: z.string(),
});

export type BridgeOrderListItem = z.infer<typeof BridgeOrderListItem>;

export const BridgeOrdersResponse = z.object({
  data: z.array(BridgeOrderListItem),
  meta: BridgeOrdersMeta,
});

export type BridgeOrdersResponse = z.infer<typeof BridgeOrdersResponse>;

export const CreateBridgeOrderRequest = z.object({
  toChainId: z.string(),
  toAddress: z.string(),
  amount: z.string(),
});

export type CreateBridgeOrderRequest = z.infer<typeof CreateBridgeOrderRequest>;

export const CreateBridgeFixedRateOrderRequest = z
  .object({
    fromChainId: z.enum(SupportedChainID),
    toChainId: z.enum(SupportedChainID),
    fromToken: z.string(),
    toToken: z.string(),
    fromAddress: z.string().optional(),
    toAddress: z.string(),
    amount: z.string(),
    rateId: z.string(),
    refundAddress: z.string(),
  })
  .transform(data => ({
    ...data,
    fromChainId: toBridgeApiChainId(data.fromChainId),
    toChainId: toBridgeApiChainId(data.toChainId),
  }));

// z.input preserves the pre-transform (app-format) type for callers
export type CreateBridgeFixedRateOrderRequest = z.input<typeof CreateBridgeFixedRateOrderRequest>;

export const CreateBridgeOrder = z.object({
  id: z.string(),
  bridgeOrderId: z.string(),
  paymentTargetAddress: z.string(),
  amount: z.string(),
  receivedAmount: z.string(),
  platformFee: z.string(),
  feeAmountToken: z.string().optional(),
  expiresAt: z.string(),
});

export type CreateBridgeOrder = z.infer<typeof CreateBridgeOrder>;

export const GetBridgeOrderRequest = z.object({
  id: z.union([z.number(), z.string()]),
});

export type GetBridgeOrderRequest = z.infer<typeof GetBridgeOrderRequest>;

export const GetBridgeEstimatedFeeRequest = z
  .object({
    fromChainId: z.enum(SupportedChainID).optional(),
    toChainId: z.enum(SupportedChainID),
    fromToken: z.string().optional(),
    toToken: z.string().optional(),
    amount: z.string(),
  })
  .transform(data => ({
    ...data,
    fromChainId: data.fromChainId ? toBridgeApiChainId(data.fromChainId) : undefined,
    toChainId: toBridgeApiChainId(data.toChainId),
  }));

export type GetBridgeEstimatedFeeRequest = z.input<typeof GetBridgeEstimatedFeeRequest>;

export const BridgeEstimatedFee = z.object({
  amount: z.string(),
  feePercentage: z.string(),
  feeAmount: z.string(),
  receivedAmount: z.string(),
  minimumAmount: z.string(),
});

export type BridgeEstimatedFee = z.infer<typeof BridgeEstimatedFee>;

export const GetBridgeFixedRateEstimatedFeeRequest = z
  .object({
    fromChainId: z.enum(SupportedChainID),
    toChainId: z.enum(SupportedChainID),
    fromToken: z.string(),
    toToken: z.string(),
    amount: z.string(),
  })
  .transform(data => ({
    ...data,
    fromChainId: toBridgeApiChainId(data.fromChainId),
    toChainId: toBridgeApiChainId(data.toChainId),
  }));

export type GetBridgeFixedRateEstimatedFeeRequest = z.input<
  typeof GetBridgeFixedRateEstimatedFeeRequest
>;

export const BridgeFixedRateEstimatedFee = z.object({
  amount: z.string(),
  feePercentage: z.string(),
  feeAmount: z.string(),
  feeAmountToken: z.string().optional(),
  receivedAmount: z.string(),
  minimumAmount: z.string(),
  rateId: z.string(),
  rateExpiresAt: z.string(),
});

export type BridgeFixedRateEstimatedFee = z.infer<typeof BridgeFixedRateEstimatedFee>;

export const UpdateBridgePaymentTxHashRequest = z.object({
  id: z.union([z.number(), z.string()]),
  txHash: z.string(),
  gasFee: z.string(),
});

export type UpdateBridgePaymentTxHashRequest = z.infer<typeof UpdateBridgePaymentTxHashRequest>;

export const GetBridgeOrderMetaRequest = z
  .object({
    fromChainId: z.enum(SupportedChainID).optional(),
    toChainId: z.enum(SupportedChainID),
    fromToken: z.string().optional(),
    toToken: z.string().optional(),
  })
  .transform(data => ({
    ...data,
    fromChainId: data.fromChainId ? toBridgeApiChainId(data.fromChainId) : undefined,
    toChainId: toBridgeApiChainId(data.toChainId),
  }));

export type GetBridgeOrderMetaRequest = z.input<typeof GetBridgeOrderMetaRequest>;

export const BridgeOrderMeta = z.object({
  minimumAmount: z.string(),
  maximumAmount: z.string(),
  fixedRateMinimumAmount: z.string().optional(),
  fixedRateMaximumAmount: z.string().optional(),
});

export type BridgeOrderMeta = z.infer<typeof BridgeOrderMeta>;

export const BridgeTokenPair = z.object({
  fromToken: z.string(),
  toToken: z.string(),
});

export type BridgeTokenPair = z.infer<typeof BridgeTokenPair>;

export const BridgeTargetChain = z.object({
  chainId: z.string(),
  name: z.string(),
  tokenPairs: z.array(BridgeTokenPair),
});

export type BridgeTargetChain = z.infer<typeof BridgeTargetChain>;

export const BridgeChain = z.object({
  chainId: z.string(),
  name: z.string(),
  targetChains: z.array(BridgeTargetChain),
});

export type BridgeChain = z.infer<typeof BridgeChain>;

export const BridgeSupportedChains = z.object({
  chains: z.array(BridgeChain),
});

export type BridgeSupportedChains = z.infer<typeof BridgeSupportedChains>;

export const BridgeMetaPairTokenPair = z.object({
  from: z.string(),
  to: z.string(),
});

export type BridgeMetaPairTokenPair = z.infer<typeof BridgeMetaPairTokenPair>;

export const BridgeMetaPairTargetChain = z
  .object({
    chainId: z.enum(SupportedChainID),
    chainName: z.string(),
    tokenPairs: z.array(BridgeMetaPairTokenPair),
  })
  .transform(chain => ({
    ...chain,
    chainId: fromBridgeApiChainId(chain.chainId),
  }));

export type BridgeMetaPairTargetChain = z.infer<typeof BridgeMetaPairTargetChain>;

export const BridgeMetaPairChain = z
  .object({
    chainId: z.enum(SupportedChainID),
    chainName: z.string(),
    targetChains: z.array(BridgeMetaPairTargetChain),
  })
  .transform(chain => ({
    ...chain,
    chainId: fromBridgeApiChainId(chain.chainId),
  }));

export type BridgeMetaPairChain = z.infer<typeof BridgeMetaPairChain>;

export const BridgeMetaPairs = z.array(BridgeMetaPairChain);

export type BridgeMetaPairs = z.infer<typeof BridgeMetaPairs>;
