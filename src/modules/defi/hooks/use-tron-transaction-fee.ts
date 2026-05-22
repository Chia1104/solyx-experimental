import { useEffect, useMemo, useState } from 'react';

import BigNumber from 'bignumber.js';
import { parseUnits } from 'ethers';
import { TronWeb } from 'tronweb';

import { useChainAdapterStore } from '@/modules/chain/stores/chain-adapter';
import { ChainType } from '@/modules/chain/stores/chain-adapter/types';

import { useDefiAccount } from './use-defi-account';

interface UserAccountData {
  bandwidthBalance: number;
  energyBalance: number;
}

type ChainParameter = { key: string; value: number }[];

export interface TronSendTrc20FeeParams {
  contract: string;
  method: string;
  params: { type: string; value: string }[];
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

export const useTronTransactionFee = (chainId?: number) => {
  const { chainType, currentAddress, currentChainId, tronAddress } = useDefiAccount();
  const getTronProvider = useChainAdapterStore(state => state.getTronProvider);

  const targetChainId = chainId ?? currentChainId;
  const isTron = chainType === ChainType.TRON;

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

  const [chainParameters, setChainParameters] = useState<ChainParameter>([]);
  const [isReady, setIsReady] = useState(false);
  const [userAccountData, setUserAccountData] = useState<UserAccountData>({
    bandwidthBalance: 0,
    energyBalance: 0,
  });

  const estimateBandwidth = async (rawDataHex: string) => {
    if (!provider) {
      return null;
    }

    const transactionFee = chainParameters.find(item => item.key === 'getTransactionFee')?.value;
    if (!transactionFee) {
      return null;
    }

    const DATA_HEX_PROTOBUF_EXTRA = 3;
    const MAX_RESULT_SIZE_IN_TX = 64;
    const A_SIGNATURE = 67;
    const bandwidthConsumed =
      rawDataHex.length / 2 + DATA_HEX_PROTOBUF_EXTRA + MAX_RESULT_SIZE_IN_TX + A_SIGNATURE;
    const remainingBandwidth = userAccountData.bandwidthBalance - bandwidthConsumed;

    if (remainingBandwidth >= 0) {
      return 0;
    }

    return new BigNumber(remainingBandwidth)
      .absoluteValue()
      .multipliedBy(transactionFee)
      .toNumber();
  };

  const estimateEnergy = async (contractFeeParams: TronSendTrc20FeeParams) => {
    if (!provider) {
      return null;
    }

    const energyFee = chainParameters.find(item => item.key === 'getEnergyFee')?.value;
    if (!energyFee) {
      return null;
    }

    const { contract, method = 'transfer(address,uint256)', params } = contractFeeParams;
    const normalizedParams = normalizeContractParams(params);
    const transaction = await provider.transactionBuilder.estimateEnergy(
      TronWeb.address.toHex(contract),
      method,
      { feeLimit: 100000000, callValue: 0 },
      normalizedParams,
      provider.defaultAddress.hex || TronWeb.address.toHex(tronAddress),
    );

    const energyRequired = transaction?.energy_required ?? 0;
    const remainingEnergy = userAccountData.energyBalance - energyRequired;

    if (remainingEnergy >= 0) {
      return 0;
    }

    return new BigNumber(remainingEnergy).absoluteValue().multipliedBy(energyFee).toNumber();
  };

  const checkAccountExists = async (address: string) => {
    if (!provider || !TronWeb.isAddress(address)) {
      return false;
    }

    try {
      const account = await provider.trx.getAccount(address);
      return !!account?.address;
    } catch {
      return false;
    }
  };

  const getCreateAccountFeeIfNeeded = async (toAddress: string) => {
    if (!provider) {
      return new BigNumber(0);
    }

    const accountExists = await checkAccountExists(toAddress);
    if (accountExists) {
      return new BigNumber(0);
    }

    const createNewAccountFeeInSystemContract =
      chainParameters.find(item => item.key === 'getCreateNewAccountFeeInSystemContract')?.value ??
      0;
    const createAccountFee =
      chainParameters.find(item => item.key === 'getCreateAccountFee')?.value ?? 0;

    return new BigNumber(createNewAccountFeeInSystemContract).plus(createAccountFee);
  };

  const getSendTrxFee = async (toAddress: string) => {
    if (!provider) {
      return '-';
    }

    let fee = await getCreateAccountFeeIfNeeded(toAddress);
    const tx = await provider.transactionBuilder.sendTrx(toAddress, 10, tronAddress);

    try {
      const bandwidthFee = await estimateBandwidth(tx.raw_data_hex);
      if (typeof bandwidthFee === 'number' && bandwidthFee > 0) {
        fee = fee.plus(bandwidthFee);
      }
    } catch {
      // ignore bandwidth estimation errors
    }

    const feeNum = fee.toNumber();
    return feeNum === 0 ? '0' : TronWeb.fromSun(feeNum);
  };

  const getSendTrc20Fee = async (toAddress: string, contractFeeParams: TronSendTrc20FeeParams) => {
    if (!provider) {
      return '-';
    }

    let fee = await getCreateAccountFeeIfNeeded(toAddress);
    const { contract, method = 'transfer(address,uint256)', params } = contractFeeParams;
    const normalizedParams = normalizeContractParams(params);
    const tx = await provider.transactionBuilder.triggerSmartContract(
      TronWeb.address.toHex(contract),
      method,
      { feeLimit: 100000000, callValue: 0 },
      normalizedParams,
      TronWeb.address.toHex(toAddress),
    );

    try {
      const bandwidthFee = await estimateBandwidth(tx.transaction.raw_data_hex);
      if (typeof bandwidthFee === 'number' && bandwidthFee > 0) {
        fee = fee.plus(bandwidthFee);
      }
    } catch {
      // ignore bandwidth estimation errors
    }

    try {
      const energyFee = await estimateEnergy(contractFeeParams);
      if (typeof energyFee === 'number' && energyFee > 0) {
        fee = fee.plus(energyFee);
      }
    } catch {
      // ignore energy estimation errors
    }

    const feeNum = fee.toNumber();
    return feeNum === 0 ? '0' : TronWeb.fromSun(feeNum);
  };

  useEffect(() => {
    if (!provider || !tronAddress) {
      return;
    }

    provider.setAddress(tronAddress);
    void provider.trx.getChainParameters().then((res: ChainParameter) => {
      setChainParameters(res);
    });
  }, [provider, tronAddress]);

  useEffect(() => {
    if (!isTron || !tronAddress || !provider) {
      return;
    }

    void provider.trx.getAccountResources(tronAddress).then(data => {
      const resources = data as unknown as Record<string, number | undefined>;
      const freeNetLimit = resources.freeNetLimit ?? resources.free_net_limit ?? 0;
      const freeNetUsed = resources.freeNetUsed ?? resources.free_net_used ?? 0;
      const netLimit = resources.NetLimit ?? resources.net_limit ?? 0;
      const netUsed = resources.NetUsed ?? resources.net_used ?? 0;
      const energyLimit = resources.EnergyLimit ?? resources.energy_limit ?? 0;
      const energyUsed = resources.EnergyUsed ?? resources.energy_used ?? 0;
      const bandwidthBalance = freeNetLimit - freeNetUsed + (netLimit - netUsed);
      const energyBalance = energyLimit - energyUsed;

      setUserAccountData({
        bandwidthBalance: Math.max(0, bandwidthBalance),
        energyBalance: Math.max(0, energyBalance),
      });
      setIsReady(true);
    });
  }, [isTron, provider, tronAddress]);

  return {
    currentAddress,
    getSendTrc20Fee,
    getSendTrxFee,
    isReady: chainParameters.length > 0 && isReady,
  };
};
