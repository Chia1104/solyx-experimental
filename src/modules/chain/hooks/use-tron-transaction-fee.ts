import { useCallback, useMemo } from 'react';

import type { UseQueryOptions } from '@tanstack/react-query';
import { queryOptions, useQuery } from '@tanstack/react-query';
import BigNumber from 'bignumber.js';
import { parseUnits } from 'ethers';
import type { TronWeb } from 'tronweb';
import { TronWeb as TronWebConstructor } from 'tronweb';

import { useChainAdapterStore } from '@/modules/chain/stores/chain-adapter';
import { ChainType } from '@/modules/chain/stores/chain-adapter/types';
import { useDefiAccount } from '@/modules/defi/hooks/use-defi-account';

const TRON_FEE_CONTEXT_STALE_TIME_MS = 15_000;

type ChainParameter = { key: string; value: number }[];

interface UserAccountData {
  bandwidthBalance: number;
  energyBalance: number;
}

export interface TronFeeContext {
  chainParameters: ChainParameter;
  userAccountData: UserAccountData;
}

export interface TronSendTrc20FeeParams {
  contract: string;
  method: string;
  params: { type: string; value: string }[];
}

export interface QueryTronFeeContextRequest {
  chainId: number;
  provider: TronWeb;
  tronAddress: string;
}

const normalizeContractParams = (
  params: { type: string; value: string }[],
  defaultDecimals = 6,
) => {
  return params.map(param => {
    if (param.type !== 'uint256') {
      return param;
    }

    if (param.value.includes('.')) {
      try {
        return { ...param, value: parseUnits(param.value, defaultDecimals).toString() };
      } catch {
        return param;
      }
    }

    return param;
  });
};

const parseTronAccountResources = (data: unknown): UserAccountData => {
  const resources = data as Record<string, number | undefined>;
  const freeNetLimit = resources.freeNetLimit ?? resources.free_net_limit ?? 0;
  const freeNetUsed = resources.freeNetUsed ?? resources.free_net_used ?? 0;
  const netLimit = resources.NetLimit ?? resources.net_limit ?? 0;
  const netUsed = resources.NetUsed ?? resources.net_used ?? 0;
  const energyLimit = resources.EnergyLimit ?? resources.energy_limit ?? 0;
  const energyUsed = resources.EnergyUsed ?? resources.energy_used ?? 0;
  const bandwidthBalance = freeNetLimit - freeNetUsed + (netLimit - netUsed);
  const energyBalance = energyLimit - energyUsed;

  return {
    bandwidthBalance: Math.max(0, bandwidthBalance),
    energyBalance: Math.max(0, energyBalance),
  };
};

const fetchTronFeeContext = async ({
  provider,
  tronAddress,
}: QueryTronFeeContextRequest): Promise<TronFeeContext> => {
  provider.setAddress(tronAddress);

  const [chainParameters, accountResources] = await Promise.all([
    provider.trx.getChainParameters() as Promise<ChainParameter>,
    provider.trx.getAccountResources(tronAddress),
  ]);

  return {
    chainParameters,
    userAccountData: parseTronAccountResources(accountResources),
  };
};

type UseQueryTronFeeContextOptions = Omit<
  UseQueryOptions<TronFeeContext, Error>,
  'queryKey' | 'queryFn'
>;

export const queryTronFeeContextOptions = (
  request: QueryTronFeeContextRequest | null,
  options?: UseQueryTronFeeContextOptions,
) => {
  return queryOptions({
    queryKey: ['chain', 'tron-fee-context', request?.chainId, request?.tronAddress],
    queryFn: () => fetchTronFeeContext(request!),
    enabled: Boolean(request),
    staleTime: TRON_FEE_CONTEXT_STALE_TIME_MS,
    retry: false,
    ...options,
  });
};

interface TronFeeEstimatorDeps {
  context: TronFeeContext;
  provider: TronWeb;
  tronAddress: string;
}

const estimateBandwidth = async ({ context }: TronFeeEstimatorDeps, rawDataHex: string) => {
  const transactionFee = context.chainParameters.find(
    item => item.key === 'getTransactionFee',
  )?.value;
  if (!transactionFee) {
    return null;
  }

  const DATA_HEX_PROTOBUF_EXTRA = 3;
  const MAX_RESULT_SIZE_IN_TX = 64;
  const A_SIGNATURE = 67;
  const bandwidthConsumed =
    rawDataHex.length / 2 + DATA_HEX_PROTOBUF_EXTRA + MAX_RESULT_SIZE_IN_TX + A_SIGNATURE;
  const remainingBandwidth = context.userAccountData.bandwidthBalance - bandwidthConsumed;

  if (remainingBandwidth >= 0) {
    return 0;
  }

  return new BigNumber(remainingBandwidth).absoluteValue().multipliedBy(transactionFee).toNumber();
};

const estimateEnergy = async (
  { context, provider, tronAddress }: TronFeeEstimatorDeps,
  contractFeeParams: TronSendTrc20FeeParams,
) => {
  const energyFee = context.chainParameters.find(item => item.key === 'getEnergyFee')?.value;
  if (!energyFee) {
    return null;
  }

  const { contract, method = 'transfer(address,uint256)', params } = contractFeeParams;
  const normalizedParams = normalizeContractParams(params);
  const transaction = await provider.transactionBuilder.estimateEnergy(
    TronWebConstructor.address.toHex(contract),
    method,
    { feeLimit: 100000000, callValue: 0 },
    normalizedParams,
    provider.defaultAddress.hex || TronWebConstructor.address.toHex(tronAddress),
  );

  const energyRequired = transaction?.energy_required ?? 0;
  const remainingEnergy = context.userAccountData.energyBalance - energyRequired;

  if (remainingEnergy >= 0) {
    return 0;
  }

  return new BigNumber(remainingEnergy).absoluteValue().multipliedBy(energyFee).toNumber();
};

const checkAccountExists = async (provider: TronWeb, address: string) => {
  if (!TronWebConstructor.isAddress(address)) {
    return false;
  }

  try {
    const account = await provider.trx.getAccount(address);
    return !!account?.address;
  } catch {
    return false;
  }
};

const getCreateAccountFeeIfNeeded = async (deps: TronFeeEstimatorDeps, toAddress: string) => {
  const accountExists = await checkAccountExists(deps.provider, toAddress);
  if (accountExists) {
    return new BigNumber(0);
  }

  const createNewAccountFeeInSystemContract =
    deps.context.chainParameters.find(item => item.key === 'getCreateNewAccountFeeInSystemContract')
      ?.value ?? 0;
  const createAccountFee =
    deps.context.chainParameters.find(item => item.key === 'getCreateAccountFee')?.value ?? 0;

  return new BigNumber(createNewAccountFeeInSystemContract).plus(createAccountFee);
};

export const estimateSendTrxFee = async (deps: TronFeeEstimatorDeps, toAddress: string) => {
  let fee = await getCreateAccountFeeIfNeeded(deps, toAddress);
  const tx = await deps.provider.transactionBuilder.sendTrx(toAddress, 10, deps.tronAddress);

  try {
    const bandwidthFee = await estimateBandwidth(deps, tx.raw_data_hex);
    if (typeof bandwidthFee === 'number' && bandwidthFee > 0) {
      fee = fee.plus(bandwidthFee);
    }
  } catch {
    // ignore bandwidth estimation errors
  }

  const feeNum = fee.toNumber();
  return feeNum === 0 ? '0' : TronWebConstructor.fromSun(feeNum);
};

export const estimateSendTrc20Fee = async (
  deps: TronFeeEstimatorDeps,
  toAddress: string,
  contractFeeParams: TronSendTrc20FeeParams,
) => {
  let fee = await getCreateAccountFeeIfNeeded(deps, toAddress);
  const { contract, method = 'transfer(address,uint256)', params } = contractFeeParams;
  const normalizedParams = normalizeContractParams(params);
  const tx = await deps.provider.transactionBuilder.triggerSmartContract(
    TronWebConstructor.address.toHex(contract),
    method,
    { feeLimit: 100000000, callValue: 0 },
    normalizedParams,
    TronWebConstructor.address.toHex(toAddress),
  );

  try {
    const bandwidthFee = await estimateBandwidth(deps, tx.transaction.raw_data_hex);
    if (typeof bandwidthFee === 'number' && bandwidthFee > 0) {
      fee = fee.plus(bandwidthFee);
    }
  } catch {
    // ignore bandwidth estimation errors
  }

  try {
    const energyFee = await estimateEnergy(deps, contractFeeParams);
    if (typeof energyFee === 'number' && energyFee > 0) {
      fee = fee.plus(energyFee);
    }
  } catch {
    // ignore energy estimation errors
  }

  const feeNum = fee.toNumber();
  return feeNum === 0 ? '0' : TronWebConstructor.fromSun(feeNum);
};

export const useTronTransactionFee = (
  chainId?: number,
  tronAddressOverride?: string,
  options?: UseQueryTronFeeContextOptions,
) => {
  const { chainType, currentAddress, currentChainId, tronAddress } = useDefiAccount();
  const getTronProvider = useChainAdapterStore(state => state.getTronProvider);

  const targetChainId = chainId ?? currentChainId;
  const targetTronAddress = tronAddressOverride ?? tronAddress;
  const isTron = chainId != null || chainType === ChainType.TRON;

  const provider = useMemo(() => {
    if (!isTron) {
      return undefined;
    }

    try {
      return getTronProvider(targetChainId);
    } catch {
      return undefined;
    }
  }, [getTronProvider, isTron, targetChainId]);

  const request = useMemo((): QueryTronFeeContextRequest | null => {
    if (!isTron || !provider || !targetTronAddress) {
      return null;
    }

    return {
      chainId: targetChainId,
      provider,
      tronAddress: targetTronAddress,
    };
  }, [isTron, provider, targetChainId, targetTronAddress]);

  const contextQuery = useQuery(queryTronFeeContextOptions(request, options));
  const context = contextQuery.data;

  const estimatorDeps = useMemo((): TronFeeEstimatorDeps | null => {
    if (!provider || !context || !targetTronAddress) {
      return null;
    }

    return { context, provider, tronAddress: targetTronAddress };
  }, [context, provider, targetTronAddress]);

  const getSendTrxFee = useCallback(
    async (toAddress: string) => {
      if (!estimatorDeps) {
        return '-';
      }

      return estimateSendTrxFee(estimatorDeps, toAddress);
    },
    [estimatorDeps],
  );

  const getSendTrc20Fee = useCallback(
    async (toAddress: string, contractFeeParams: TronSendTrc20FeeParams) => {
      if (!estimatorDeps) {
        return '-';
      }

      return estimateSendTrc20Fee(estimatorDeps, toAddress, contractFeeParams);
    },
    [estimatorDeps],
  );

  return {
    currentAddress,
    getSendTrc20Fee,
    getSendTrxFee,
    isReady: Boolean(context && context.chainParameters.length > 0),
  };
};
