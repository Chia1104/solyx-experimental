import BigNumber from 'bignumber.js';
import type { FeeData } from 'ethers';
import { formatUnits, parseUnits } from 'ethers';

export type EvmGasMode = 'slow' | 'average' | 'fast';

export const EVM_GAS_MODES: EvmGasMode[] = ['slow', 'average', 'fast'];

export interface EvmGasSettingItem {
  gasFee: string;
  gasPrice?: string;
  gasPriceGwei: string;
  maxFeePerGas?: string;
  maxPriorityFeePerGas?: string;
}

export interface EvmGasSettings {
  slow: EvmGasSettingItem;
  average: EvmGasSettingItem;
  fast: EvmGasSettingItem;
}

const HALF_GWEI = parseUnits('0.5', 'gwei');

const minBigInt = (left: bigint, right: bigint) => (left < right ? left : right);

const formatGasFee = (gasLimit: bigint, maxFeeCap: bigint, gasPrice: bigint) => {
  const feeWei = minBigInt(gasLimit * maxFeeCap, gasLimit * gasPrice);
  return new BigNumber(formatUnits(feeWei, 18)).decimalPlaces(8, 1).toString();
};

const formatGwei = (value: bigint) =>
  new BigNumber(formatUnits(value, 'gwei')).decimalPlaces(2, 1).toString();

const toGasSettingItem = (
  gasLimit: bigint,
  maxFeeCap: bigint,
  gasPrice: bigint,
  maxFeePerGas?: string,
  maxPriorityFeePerGas?: string,
): EvmGasSettingItem => ({
  gasFee: formatGasFee(gasLimit, maxFeeCap, gasPrice),
  gasPrice: gasPrice.toString(),
  gasPriceGwei: formatGwei(gasPrice),
  maxFeePerGas,
  maxPriorityFeePerGas,
});

const buildLegacyGasSettings = (gasPrice: bigint, gasLimit: bigint): EvmGasSettings => {
  const slowGasPrice = gasPrice > HALF_GWEI ? gasPrice - HALF_GWEI : gasPrice;
  const fastGasPrice = gasPrice + HALF_GWEI;

  return {
    slow: toGasSettingItem(gasLimit, slowGasPrice, slowGasPrice, undefined, undefined),
    average: toGasSettingItem(gasLimit, gasPrice, gasPrice, undefined, undefined),
    fast: toGasSettingItem(gasLimit, fastGasPrice, fastGasPrice, undefined, undefined),
  };
};

export const buildEvmGasSettings = (
  feeData: FeeData,
  gasLimit: bigint,
): EvmGasSettings | undefined => {
  const gasPrice = feeData.gasPrice;
  const maxFeePerGas = feeData.maxFeePerGas;
  const maxPriorityFeePerGas = feeData.maxPriorityFeePerGas;

  if (gasLimit <= 0n) {
    return undefined;
  }

  if (gasPrice != null && (maxFeePerGas == null || maxPriorityFeePerGas == null)) {
    return buildLegacyGasSettings(gasPrice, gasLimit);
  }

  if (maxFeePerGas == null || maxPriorityFeePerGas == null || gasPrice == null) {
    return undefined;
  }

  const lastBaseFeePerGas =
    maxFeePerGas > maxPriorityFeePerGas ? maxFeePerGas - maxPriorityFeePerGas : gasPrice;

  const slowPriorityFeePerGas =
    maxPriorityFeePerGas > HALF_GWEI ? maxPriorityFeePerGas - HALF_GWEI : 0n;
  const fastPriorityFeePerGas = maxPriorityFeePerGas + HALF_GWEI;

  const slowGasPrice = lastBaseFeePerGas + slowPriorityFeePerGas;
  const averageGasPrice = lastBaseFeePerGas + maxPriorityFeePerGas;
  const fastGasPrice = lastBaseFeePerGas + fastPriorityFeePerGas;

  const slowMaxFeePerGas = maxFeePerGas > HALF_GWEI ? maxFeePerGas - HALF_GWEI : maxFeePerGas;
  const fastMaxFeePerGas = maxFeePerGas + HALF_GWEI;

  return {
    slow: toGasSettingItem(
      gasLimit,
      slowMaxFeePerGas,
      slowGasPrice,
      slowMaxFeePerGas.toString(),
      slowPriorityFeePerGas.toString(),
    ),
    average: toGasSettingItem(
      gasLimit,
      maxFeePerGas,
      averageGasPrice,
      maxFeePerGas.toString(),
      maxPriorityFeePerGas.toString(),
    ),
    fast: toGasSettingItem(
      gasLimit,
      fastMaxFeePerGas,
      fastGasPrice,
      fastMaxFeePerGas.toString(),
      fastPriorityFeePerGas.toString(),
    ),
  };
};

export const getEvmGasModeLabelKey = (mode: EvmGasMode) => {
  switch (mode) {
    case 'slow':
      return 'defi:label.slow' as const;
    case 'fast':
      return 'defi:label.fast' as const;
    default:
      return 'defi:label.average' as const;
  }
};

export const EVM_GAS_MODE_ETA = {
  slow: { amount: 1, unitKey: 'global:unit.min' as const },
  average: { amount: 30, unitKey: 'global:unit.sec' as const },
  fast: { amount: 15, unitKey: 'global:unit.sec' as const },
};
