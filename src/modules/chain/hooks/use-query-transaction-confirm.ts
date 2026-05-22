import type { UseQueryOptions } from '@tanstack/react-query';
import { queryOptions, useQuery } from '@tanstack/react-query';
import BigNumber from 'bignumber.js';
import type { JsonRpcProvider } from 'ethers';
import { parseUnits } from 'ethers';

import type { UnsignedTransaction } from '@roswell/react-native-gdk';

import { useChainAdapterStore } from '@/modules/chain/stores/chain-adapter';
import type {
  ChainConfig,
  GasEstimate,
  LiquidChainAdapterActions,
} from '@/modules/chain/stores/chain-adapter/types';
import type { TransactionParams } from '@/modules/chain/stores/chain-adapter/types';
import type {
  TransactionChainInfo,
  TransactionConfirmParams,
  TransactionCurrency,
} from '@/modules/chain/utils/transaction-confirm';
import {
  buildEvmTransactionDraft,
  estimateEvmGasLimit,
  formatEvmGasFee,
} from '@/modules/chain/utils/transaction-confirm';

import type { TronSendTrc20FeeParams } from './use-tron-transaction-fee';
import { useTronTransactionFee } from './use-tron-transaction-fee';

const TRANSACTION_CONFIRM_STALE_TIME = 15 * 1000;
const TRANSACTION_CONFIRM_QUERY_KEY = 'chain/transaction-confirm';

export interface LiquidPreparedTransaction {
  fee: string;
  unsignedTransaction: UnsignedTransaction;
}

interface EvmTransactionFeeDeps {
  estimateEvmGas: (params: TransactionParams) => Promise<GasEstimate>;
}

export interface QueryEvmTransactionFeeRequest extends EvmTransactionFeeDeps {
  address: string;
  chain: ChainConfig;
  currency?: TransactionCurrency;
  sendParams: TransactionConfirmParams;
  provider: JsonRpcProvider;
  toAddress: string;
  value: string;
}

interface TronTransactionFeeDeps {
  getSendTrc20Fee: (to: string, payload: TronSendTrc20FeeParams) => Promise<unknown>;
  getSendTrxFee: (to: string) => Promise<unknown>;
  isReady: boolean;
}

export interface QueryTronTransactionFeeRequest extends TronTransactionFeeDeps {
  currency?: TransactionCurrency;
  isNativeCurrency: boolean;
  sendParams: TransactionConfirmParams;
  toAddress: string;
  value: string;
}

type LiquidPreparedTransactionDeps = Pick<
  LiquidChainAdapterActions,
  'calculateTransactionFeeInLBTC' | 'createTransaction' | 'getUnspentOutputs'
>;

export interface QueryLiquidPreparedTransactionRequest extends LiquidPreparedTransactionDeps {
  assetId: string;
  currencyDecimals?: number;
  sendParams: TransactionConfirmParams;
  subaccountPointer?: number;
}

interface LiquidFeeFallbackDeps {
  calculateTransactionFeeInLBTC: () => Promise<string>;
}

const formatTronFee = (fee: unknown) => {
  if (fee === undefined || fee === null) {
    return 'null';
  }
  return String(fee);
};

const fetchEvmTransactionFee = async (request: QueryEvmTransactionFeeRequest) => {
  const chainInfo: TransactionChainInfo = {
    chainId: request.chain.chainId,
    nativeCurrency: request.chain.nativeCurrency,
  };
  const draft = await buildEvmTransactionDraft({
    currency: request.currency,
    params: request.sendParams,
    chainInfo,
    toAddress: request.toAddress,
    value: request.value,
  });

  const estimate = await request.estimateEvmGas({
    from: request.address,
    to: draft.txTo,
    value: draft.txValue,
    data: draft.txData,
    chainId: request.chain.chainId,
    privateKey: '0x0',
  });

  return formatEvmGasFee(estimate.totalFee, request.chain.nativeCurrency.decimals);
};

const fetchTronTransactionFee = async (request: QueryTronTransactionFeeRequest) => {
  if (!request.isReady) {
    return '-';
  }

  if (request.isNativeCurrency) {
    return formatTronFee(await request.getSendTrxFee(request.sendParams.to));
  }

  if (!request.currency || !request.sendParams.tokenAddress) {
    return 'null';
  }

  const valueInSmallestUnit = parseUnits(
    request.value || '0',
    request.currency.decimals,
  ).toString();

  const fee = await request.getSendTrc20Fee(request.sendParams.to, {
    contract: request.sendParams.tokenAddress,
    method: 'transfer(address,uint256)',
    params: [
      { type: 'address', value: request.toAddress },
      { type: 'uint256', value: valueInSmallestUnit },
    ],
  });

  return formatTronFee(fee);
};

const fetchLiquidPreparedTransaction = async (request: QueryLiquidPreparedTransactionRequest) => {
  const { sendParams } = request;

  if (!sendParams.to || !sendParams.value) {
    throw new Error('Liquid transaction is not ready');
  }

  const decimals = request.currencyDecimals ?? 8;
  const satoshiValue = BigNumber(parseUnits(sendParams.value, decimals).toString()).toNumber();
  const utxos = await request.getUnspentOutputs({
    subaccount: request.subaccountPointer ?? 0,
    num_confs: 0,
  });
  const unsignedTransaction = await request.createTransaction({
    addressees: [
      {
        address: sendParams.to,
        satoshi: satoshiValue,
        asset_id: request.assetId,
      },
    ],
    utxos,
  });
  const fee = await request.calculateTransactionFeeInLBTC(unsignedTransaction);

  return { fee, unsignedTransaction };
};

type UseQueryEvmTransactionFeeOptions = Omit<
  UseQueryOptions<string, Error>,
  'queryKey' | 'queryFn'
>;

export const queryEvmTransactionFeeOptions = (
  request: QueryEvmTransactionFeeRequest,
  options?: UseQueryEvmTransactionFeeOptions,
) => {
  return queryOptions({
    queryKey: [
      TRANSACTION_CONFIRM_QUERY_KEY,
      'evm-fee',
      request.chain.chainId,
      request.address,
      request.toAddress,
      request.value,
      request.sendParams.tokenAddress,
      request.sendParams.data,
    ],
    queryFn: () => fetchEvmTransactionFee(request),
    staleTime: TRANSACTION_CONFIRM_STALE_TIME,
    retry: false,
    ...options,
  });
};

export interface UseQueryEvmTransactionFeeInput {
  address: string;
  chain?: ChainConfig;
  currency?: TransactionCurrency;
  sendParams: TransactionConfirmParams;
  provider?: JsonRpcProvider;
  toAddress: string;
  value: string;
}

type UseQueryEvmGasLimitOptions = Omit<UseQueryOptions<string, Error>, 'queryKey' | 'queryFn'>;

export const queryEvmGasLimitOptions = (
  input: UseQueryEvmTransactionFeeInput,
  options?: UseQueryEvmGasLimitOptions,
) => {
  const canQuery = Boolean(input.chain && input.provider && input.address && input.toAddress);

  return queryOptions({
    queryKey: [
      TRANSACTION_CONFIRM_QUERY_KEY,
      'evm-gas-limit',
      input.chain?.chainId,
      input.address,
      input.toAddress,
      input.value,
      input.sendParams.tokenAddress,
      input.sendParams.data,
    ],
    queryFn: async () => {
      if (!input.chain || !input.provider) {
        throw new Error('EVM gas limit query is not ready');
      }

      const chainInfo: TransactionChainInfo = {
        chainId: input.chain.chainId,
        nativeCurrency: input.chain.nativeCurrency,
      };
      const draft = await buildEvmTransactionDraft({
        currency: input.currency,
        params: input.sendParams,
        chainInfo,
        toAddress: input.toAddress,
        value: input.value,
      });

      return estimateEvmGasLimit({
        address: input.address,
        draft,
        params: input.sendParams,
        provider: input.provider,
      });
    },
    enabled: canQuery && (options?.enabled ?? true),
    staleTime: TRANSACTION_CONFIRM_STALE_TIME,
    retry: false,
    ...options,
  });
};

export const useQueryEvmGasLimit = (
  input: UseQueryEvmTransactionFeeInput,
  options?: UseQueryEvmGasLimitOptions,
) => {
  return useQuery(queryEvmGasLimitOptions(input, options));
};

export const useQueryEvmTransactionFee = (
  input: UseQueryEvmTransactionFeeInput,
  options?: UseQueryEvmTransactionFeeOptions,
) => {
  const estimateEvmGas = useChainAdapterStore(state => state.estimateEvmGas);
  const canQuery = Boolean(input.chain && input.provider && input.address && input.toAddress);

  return useQuery({
    ...queryEvmTransactionFeeOptions(
      {
        address: input.address,
        chain: input.chain!,
        currency: input.currency,
        estimateEvmGas,
        provider: input.provider!,
        sendParams: input.sendParams,
        toAddress: input.toAddress,
        value: input.value,
      },
      options,
    ),
    enabled: canQuery && (options?.enabled ?? true),
  });
};

type UseQueryTronTransactionFeeOptions = Omit<
  UseQueryOptions<string, Error>,
  'queryKey' | 'queryFn'
>;

export const queryTronTransactionFeeOptions = (
  request: QueryTronTransactionFeeRequest,
  options?: UseQueryTronTransactionFeeOptions,
) => {
  return queryOptions({
    queryKey: [
      TRANSACTION_CONFIRM_QUERY_KEY,
      'tron-fee',
      request.isReady,
      request.isNativeCurrency,
      request.toAddress,
      request.value,
      request.sendParams.tokenAddress,
      request.currency?.decimals,
    ],
    queryFn: () => fetchTronTransactionFee(request),
    staleTime: TRANSACTION_CONFIRM_STALE_TIME,
    retry: false,
    ...options,
  });
};

export interface UseQueryTronTransactionFeeInput {
  currency?: TransactionCurrency;
  isNativeCurrency: boolean;
  sendParams: TransactionConfirmParams;
  toAddress: string;
  value: string;
}

export const useQueryTronTransactionFee = (
  input: UseQueryTronTransactionFeeInput,
  options?: UseQueryTronTransactionFeeOptions,
) => {
  const { getSendTrc20Fee, getSendTrxFee, isReady } = useTronTransactionFee();

  return useQuery(
    queryTronTransactionFeeOptions(
      {
        currency: input.currency,
        getSendTrc20Fee,
        getSendTrxFee,
        isNativeCurrency: input.isNativeCurrency,
        isReady,
        sendParams: input.sendParams,
        toAddress: input.toAddress,
        value: input.value,
      },
      options,
    ),
  );
};

type UseQueryLiquidPreparedTransactionOptions = Omit<
  UseQueryOptions<LiquidPreparedTransaction, Error>,
  'queryKey' | 'queryFn'
>;

export const queryLiquidPreparedTransactionOptions = (
  request: QueryLiquidPreparedTransactionRequest,
  options?: UseQueryLiquidPreparedTransactionOptions,
) => {
  return queryOptions({
    queryKey: [
      TRANSACTION_CONFIRM_QUERY_KEY,
      'liquid-prepared',
      request.assetId,
      request.currencyDecimals,
      request.sendParams.to,
      request.sendParams.value,
      request.subaccountPointer,
    ],
    queryFn: () => fetchLiquidPreparedTransaction(request),
    staleTime: TRANSACTION_CONFIRM_STALE_TIME,
    retry: false,
    ...options,
  });
};

export interface UseQueryLiquidPreparedTransactionInput {
  assetId?: string;
  currencyDecimals?: number;
  sendParams: TransactionConfirmParams;
  subaccountPointer?: number;
}

export const useQueryLiquidPreparedTransaction = (
  input: UseQueryLiquidPreparedTransactionInput,
  options?: UseQueryLiquidPreparedTransactionOptions,
) => {
  const createTransaction = useChainAdapterStore(state => state.createTransaction);
  const getUnspentOutputs = useChainAdapterStore(state => state.getUnspentOutputs);
  const calculateTransactionFeeInLBTC = useChainAdapterStore(
    state => state.calculateTransactionFeeInLBTC,
  );
  const canQuery = Boolean(input.assetId && input.sendParams.to && input.sendParams.value);

  return useQuery({
    ...queryLiquidPreparedTransactionOptions(
      {
        assetId: input.assetId!,
        calculateTransactionFeeInLBTC,
        createTransaction,
        currencyDecimals: input.currencyDecimals,
        getUnspentOutputs,
        sendParams: input.sendParams,
        subaccountPointer: input.subaccountPointer,
      },
      options,
    ),
    enabled: canQuery && (options?.enabled ?? true),
  });
};

type UseQueryLiquidFeeFallbackOptions = Omit<
  UseQueryOptions<string, Error>,
  'queryKey' | 'queryFn'
>;

export const queryLiquidFeeFallbackOptions = (
  deps: LiquidFeeFallbackDeps,
  options?: UseQueryLiquidFeeFallbackOptions,
) => {
  return queryOptions({
    queryKey: [TRANSACTION_CONFIRM_QUERY_KEY, 'liquid-fee-fallback'],
    queryFn: () => deps.calculateTransactionFeeInLBTC(),
    staleTime: TRANSACTION_CONFIRM_STALE_TIME,
    retry: false,
    ...options,
  });
};

export const useQueryLiquidFeeFallback = (options?: UseQueryLiquidFeeFallbackOptions) => {
  const calculateTransactionFeeInLBTC = useChainAdapterStore(
    state => state.calculateTransactionFeeInLBTC,
  );

  return useQuery(queryLiquidFeeFallbackOptions({ calculateTransactionFeeInLBTC }, options));
};
