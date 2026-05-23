import BigNumber from 'bignumber.js';
import type { JsonRpcProvider } from 'ethers';
import { Interface, formatUnits, isHexString, parseUnits } from 'ethers';

export interface TransactionConfirmParams {
  to: string;
  value: string;
  method?: string;
  data?: string;
  tokenAddress?: string;
  gasPrice?: string;
  gasLimit?: string;
  gas?: string;
  nonce?: string;
  suppressSuccessModal?: boolean;
}

const ERC20_TRANSFER_ABI = [
  'function transfer(address to, uint256 amount) returns (bool)',
] as const;
const NATIVE_TRANSFER_GAS_LIMIT = '21000';
const ERC20_TRANSFER_GAS_LIMIT = '65000';
const GAS_LIMIT_BUFFER_PERCENT = 120n;

export interface TransactionCurrency {
  decimals: number;
  symbol?: string;
}

export interface TransactionChainInfo {
  chainId: number;
  nativeCurrency: {
    address: string;
    decimals: number;
    symbol: string;
  };
}

export interface EvmTransactionDraft {
  isERC20Transfer: boolean;
  tokenDecimals: number;
  txData: string;
  txTo: string;
  txValue: string;
}

export type EvmTransactionErrorType =
  | 'transactionNotReady'
  | 'userRejected'
  | 'insufficientFunds'
  | 'gasEstimation'
  | 'network'
  | 'nonce'
  | 'transactionFailed'
  | 'unknown';

export class TransactionNotReadyError extends Error {
  readonly type = 'transactionNotReady' as const;

  constructor() {
    super('Transaction is not ready');
  }
}

export type TronTransactionErrorType =
  | 'transactionNotReady'
  | 'userRejected'
  | 'resourceInsufficient'
  | 'insufficientFunds'
  | 'network'
  | 'transactionFailed'
  | 'unknown';

export class TronTransactionNotReadyError extends Error {
  readonly type = 'transactionNotReady' as const;

  constructor() {
    super('Tron transaction is not ready');
  }
}

export type LiquidTransactionErrorType =
  | 'transactionNotReady'
  | 'amountBelowMinimum'
  | 'insufficientFunds'
  | 'rateLimited'
  | 'network'
  | 'transactionFailed'
  | 'unknown';

export class LiquidTransactionNotReadyError extends Error {
  readonly type = 'transactionNotReady' as const;

  constructor() {
    super('Liquid transaction is not ready');
  }
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const getNestedValue = (value: unknown, key: string) => {
  if (!isRecord(value)) {
    return undefined;
  }
  return value[key];
};

const getErrorCode = (error: unknown): string | undefined => {
  const code = getNestedValue(error, 'code');
  if (typeof code === 'string' || typeof code === 'number') {
    return String(code).toUpperCase();
  }

  const nestedError = getNestedValue(error, 'error');
  return nestedError ? getErrorCode(nestedError) : undefined;
};

export const getErrorText = (error: unknown): string => {
  if (typeof error === 'string') {
    return error;
  }

  if (error instanceof Error) {
    return error.message;
  }

  if (!isRecord(error)) {
    return '';
  }

  const textParts = ['message', 'reason', 'body', 'data', 'details']
    .map(key => getNestedValue(error, key))
    .filter((value): value is string => typeof value === 'string');
  const nestedText = getErrorText(error.error);

  return [...textParts, nestedText].filter(Boolean).join(' ');
};

export const getEvmTransactionErrorType = (error: unknown): EvmTransactionErrorType => {
  if (error instanceof TransactionNotReadyError) {
    return error.type;
  }

  const code = getErrorCode(error);
  const text = getErrorText(error).toLowerCase();

  if (
    code === 'ACTION_REJECTED' ||
    code === '4001' ||
    /user (rejected|denied|cancel)/i.test(text)
  ) {
    return 'userRejected';
  }

  if (
    code === 'INSUFFICIENT_FUNDS' ||
    text.includes('insufficient funds') ||
    text.includes('funds for intrinsic transaction cost')
  ) {
    return 'insufficientFunds';
  }

  if (
    code === 'UNPREDICTABLE_GAS_LIMIT' ||
    text.includes('cannot estimate gas') ||
    text.includes('intrinsic gas') ||
    text.includes('gas required exceeds allowance') ||
    text.includes('exceeds block gas limit')
  ) {
    return 'gasEstimation';
  }

  if (
    code === 'NETWORK_ERROR' ||
    code === 'SERVER_ERROR' ||
    code === 'TIMEOUT' ||
    text.includes('network') ||
    text.includes('timeout') ||
    text.includes('failed to fetch')
  ) {
    return 'network';
  }

  if (
    code === 'NONCE_EXPIRED' ||
    code === 'REPLACEMENT_UNDERPRICED' ||
    text.includes('nonce') ||
    text.includes('replacement transaction underpriced') ||
    text.includes('transaction underpriced') ||
    text.includes('already known')
  ) {
    return 'nonce';
  }

  if (
    code === 'CALL_EXCEPTION' ||
    text.includes('execution reverted') ||
    text.includes('transaction failed')
  ) {
    return 'transactionFailed';
  }

  return 'unknown';
};

export const getTronTransactionErrorType = (error: unknown): TronTransactionErrorType => {
  if (error instanceof TronTransactionNotReadyError) {
    return error.type;
  }

  const code = getErrorCode(error);
  const text = getErrorText(error).toLowerCase();

  if (
    code === 'ACTION_REJECTED' ||
    code === '4001' ||
    /user (rejected|denied|cancel)/i.test(text)
  ) {
    return 'userRejected';
  }

  if (
    text.includes('bandwidth') ||
    text.includes('energy') ||
    text.includes('resource insufficient')
  ) {
    return 'resourceInsufficient';
  }

  if (text.includes('insufficient')) {
    return 'insufficientFunds';
  }

  if (text.includes('network') || text.includes('timeout')) {
    return 'network';
  }

  if (text.includes('transaction failed') || text.includes('revert')) {
    return 'transactionFailed';
  }

  return 'unknown';
};

export const getLiquidTransactionErrorType = (error: unknown): LiquidTransactionErrorType => {
  if (error instanceof LiquidTransactionNotReadyError) {
    return error.type;
  }

  const text = getErrorText(error).toLowerCase();

  if (text.includes('id_amount_below_the_dust_threshold')) {
    return 'amountBelowMinimum';
  }

  if (text.includes('rate limit')) {
    return 'rateLimited';
  }

  if (
    text.includes('insufficient funds') ||
    text.includes('not enough') ||
    text.includes('balance')
  ) {
    return 'insufficientFunds';
  }

  if (text.includes('network') || text.includes('connection') || text.includes('timeout')) {
    return 'network';
  }

  if (text.includes('transaction failed') || text.includes('revert')) {
    return 'transactionFailed';
  }

  return 'unknown';
};

export const formatDisplayValue = (value: string) => {
  if (isHexString(value)) {
    return formatUnits(value, 'ether');
  }
  return value?.toString() || '0';
};

export const shortenAddress = (address: string) => {
  if (!address || address.length < 10) {
    return address;
  }
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
};

export const formatLiquidAddress = (address: string) => {
  if (!address) {
    return '';
  }
  if (address.length <= 20) {
    return address;
  }
  return `${address.slice(0, 10)}...${address.slice(-10)}`;
};

export const isSameAddress = (a?: string, b?: string) =>
  !!a && !!b && a.toLocaleUpperCase() === b.toLocaleUpperCase();

export const isERC20TransferParams = (
  params: TransactionConfirmParams,
  chainInfo: TransactionChainInfo,
) => !!params.tokenAddress && !isSameAddress(params.tokenAddress, chainInfo.nativeCurrency.address);

export const buildEvmTransactionDraft = async ({
  currency,
  params,
  chainInfo,
  toAddress,
  value,
}: {
  currency?: TransactionCurrency;
  params: TransactionConfirmParams;
  chainInfo: TransactionChainInfo;
  toAddress: string;
  value: string;
}): Promise<EvmTransactionDraft> => {
  const isERC20Transfer = isERC20TransferParams(params, chainInfo);
  let tokenDecimals = currency?.decimals ?? chainInfo.nativeCurrency.decimals;

  let data: string | undefined;

  if (isERC20Transfer && params.tokenAddress) {
    tokenDecimals = currency?.decimals ?? tokenDecimals;
    const iface = new Interface(ERC20_TRANSFER_ABI);
    data = iface.encodeFunctionData('transfer', [toAddress, parseUnits(value, tokenDecimals)]);
  }

  const txTo = isERC20Transfer && params.tokenAddress ? params.tokenAddress : toAddress;
  const txValue = isERC20Transfer
    ? '0'
    : parseUnits(value, chainInfo.nativeCurrency.decimals).toString();
  const txData = data || params.data || '0x';

  return {
    isERC20Transfer,
    tokenDecimals,
    txData,
    txTo,
    txValue,
  };
};

export const estimateEvmGasLimit = async ({
  address,
  draft,
  params,
  provider,
}: {
  address: string;
  draft: EvmTransactionDraft;
  params: TransactionConfirmParams;
  provider?: JsonRpcProvider;
}) => {
  if (params.gasLimit || params.gas) {
    return params.gasLimit || params.gas || NATIVE_TRANSFER_GAS_LIMIT;
  }

  if (!provider) {
    return draft.isERC20Transfer ? ERC20_TRANSFER_GAS_LIMIT : NATIVE_TRANSFER_GAS_LIMIT;
  }

  try {
    const gasEstimate = await provider.estimateGas({
      from: address,
      to: draft.txTo,
      value: draft.txValue,
      data: draft.txData,
    });
    return ((gasEstimate * GAS_LIMIT_BUFFER_PERCENT) / 100n).toString();
  } catch {
    return draft.isERC20Transfer ? ERC20_TRANSFER_GAS_LIMIT : NATIVE_TRANSFER_GAS_LIMIT;
  }
};

export const formatEvmGasFee = (totalFee: string, nativeDecimals: number) => {
  try {
    return new BigNumber(formatUnits(totalFee, nativeDecimals)).decimalPlaces(8, 1).toString();
  } catch {
    return '-';
  }
};

export const isTronRpcErrorResponse = (
  result: unknown,
): result is { code: string; message: string } =>
  isRecord(result) && typeof result.code === 'string';

export const getTronTransactionResult = (result: unknown) => {
  if (!isRecord(result)) {
    return null;
  }

  const txID =
    typeof result.txid === 'string'
      ? result.txid
      : typeof result.txID === 'string'
        ? result.txID
        : '';
  const transaction = isRecord(result.transaction) ? result.transaction : result;
  const rawDataHex =
    typeof transaction.raw_data_hex === 'string'
      ? transaction.raw_data_hex
      : typeof result.raw_data_hex === 'string'
        ? result.raw_data_hex
        : '';

  if (!txID) {
    return null;
  }

  return { rawDataHex, txID };
};
