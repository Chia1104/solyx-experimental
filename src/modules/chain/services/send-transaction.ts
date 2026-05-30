import BigNumber from 'bignumber.js';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import type { JsonRpcProvider } from 'ethers';
import { parseUnits } from 'ethers';
import { TronWeb } from 'tronweb';

import type { UnsignedTransaction } from '@roswell/react-native-gdk';

import { SupportedNetwork } from '@/modules/chain/enums/supported-chain.enum';
import type { ChainAdapter, ChainConfig } from '@/modules/chain/stores/chain-adapter/types';
import { ChainType } from '@/modules/chain/stores/chain-adapter/types';
import type { EvmGasSettingItem } from '@/modules/chain/utils/evm-gas-settings';
import type {
  EvmTransactionDraft,
  TransactionConfirmParams,
  TransactionCurrency,
} from '@/modules/chain/utils/transaction-confirm';
import {
  LiquidTransactionNotReadyError,
  TransactionNotReadyError,
  TronTransactionNotReadyError,
  buildEvmTransactionDraft,
  getTronTransactionResult,
  isTronRpcErrorResponse,
} from '@/modules/chain/utils/transaction-confirm';
import { ActionKey, RecordStatus } from '@/modules/database/enums/defi-record.enum';
import { insertRecords } from '@/modules/database/repos/defi-record.repo';
import type { NewDefiRecordRow } from '@/modules/database/schema/defi-record.schema';
import { formatDefiRecordChainId } from '@/modules/database/utils/defi-record-chain-id';

dayjs.extend(utc);

const getEvmPendingBlockNumber = async (provider?: JsonRpcProvider) => {
  if (!provider) {
    return '0';
  }

  try {
    return String(await provider.getBlockNumber());
  } catch {
    return '0';
  }
};

const getTronPendingBlockNumber = async (provider: TronWeb) => {
  try {
    const currentBlock = await provider.trx.getCurrentBlock();
    return currentBlock?.block_header?.raw_data?.number?.toString() ?? '0';
  } catch {
    return '0';
  }
};

const persistPendingRecord = async (record: NewDefiRecordRow) => {
  await insertRecords([record]);
};

interface InsertPendingEvmTransactionParams {
  chain: ChainConfig;
  currency?: TransactionCurrency;
  draft: EvmTransactionDraft;
  evmGasLimit: string;
  evmProvider: JsonRpcProvider;
  gasPrice: string;
  toAddress: string;
  txHash: string;
  userAddress: string;
  value: string;
}

const insertPendingEvmTransaction = async ({
  chain,
  currency,
  draft,
  evmGasLimit,
  evmProvider,
  gasPrice,
  toAddress,
  txHash,
  userAddress,
  value,
}: InsertPendingEvmTransactionParams) => {
  const pendingBlockNumber = await getEvmPendingBlockNumber(evmProvider);

  await persistPendingRecord({
    userAddress,
    chainId: formatDefiRecordChainId(ChainType.EVM, chain.chainId),
    blockNumber: pendingBlockNumber,
    timeStamp: dayjs.utc().unix().toString(),
    hash: txHash,
    nonce: '',
    fromAddress: userAddress,
    toAddress,
    value: draft.isERC20Transfer
      ? parseUnits(value, draft.tokenDecimals).toString()
      : parseUnits(value, chain.nativeCurrency.decimals).toString(),
    tokenSymbol: currency?.symbol ?? chain.nativeCurrency.symbol,
    tokenDecimal: draft.tokenDecimals.toString(),
    gas: evmGasLimit,
    gasPrice,
    status: RecordStatus.Pending,
    input: draft.txData,
    functionName: ActionKey.Sent,
    explorerUrl: '',
  });
};

interface InsertPendingTronTransactionParams {
  chain: ChainConfig;
  currency?: TransactionCurrency;
  fromAddress: string;
  gasFee: string;
  provider: TronWeb;
  toAddress: string;
  transaction: { rawDataHex: string; txID: string };
  value: string;
}

const insertPendingTronTransaction = async ({
  chain,
  currency,
  fromAddress,
  gasFee,
  provider,
  toAddress,
  transaction,
  value,
}: InsertPendingTronTransactionParams) => {
  const pendingBlockNumber = await getTronPendingBlockNumber(provider);
  const gas =
    gasFee && gasFee !== '-' && gasFee !== 'null'
      ? TronWeb.toSun(new BigNumber(gasFee).toNumber()).toString()
      : '0';
  const tokenDecimals = currency?.decimals ?? chain.nativeCurrency.decimals;

  await persistPendingRecord({
    userAddress: fromAddress,
    chainId: formatDefiRecordChainId(ChainType.TRON, chain.chainId),
    blockNumber: pendingBlockNumber,
    timeStamp: dayjs.utc().unix().toString(),
    hash: transaction.txID,
    nonce: '',
    fromAddress,
    toAddress,
    value: value ? parseUnits(value, tokenDecimals).toString() : '0',
    tokenSymbol: currency?.symbol ?? chain.nativeCurrency.symbol,
    tokenDecimal: tokenDecimals.toString(),
    gas,
    gasPrice: '1',
    status: RecordStatus.Pending,
    input: transaction.rawDataHex,
    functionName: ActionKey.Sent,
    explorerUrl: '',
  });
};

interface InsertPendingLiquidTransactionParams {
  chain: ChainConfig;
  currency?: TransactionCurrency;
  gasFee: string;
  toAddress: string;
  txHash: string;
  userAddress: string;
  value: string;
}

const insertPendingLiquidTransaction = async ({
  chain,
  currency,
  gasFee,
  toAddress,
  txHash,
  userAddress,
  value,
}: InsertPendingLiquidTransactionParams) => {
  const decimals = currency?.decimals ?? chain.nativeCurrency.decimals;

  await persistPendingRecord({
    userAddress,
    chainId: formatDefiRecordChainId(ChainType.LIQUID, chain.chainId),
    blockNumber: '',
    timeStamp: dayjs.utc().unix().toString(),
    hash: txHash,
    nonce: '',
    fromAddress: userAddress,
    toAddress,
    value: parseUnits(value, decimals).toString(),
    tokenSymbol: currency?.symbol ?? chain.nativeCurrency.symbol,
    tokenDecimal: decimals.toString(),
    gas: gasFee !== '-' && gasFee !== 'null' ? parseUnits(gasFee, 8).toString() : '0',
    gasPrice: '1',
    status: RecordStatus.Pending,
    input: '',
    functionName: ActionKey.Sent,
    explorerUrl: '',
  });
};

export interface ResolveTransactionPrivateKeyParams {
  chainType: ChainType;
  currentChainId: number;
  reason: string;
  requestLiquidUnlock: (options: {
    chainId?: number;
    isDismissible?: boolean;
    reason?: string;
  }) => Promise<boolean>;
  requestPrivateKey: (options: {
    isDismissible?: boolean;
    network?: SupportedNetwork;
    reason?: string;
  }) => Promise<string>;
}

export const resolveTransactionPrivateKey = async ({
  chainType,
  currentChainId,
  reason,
  requestLiquidUnlock,
  requestPrivateKey,
}: ResolveTransactionPrivateKeyParams) => {
  if (chainType === ChainType.LIQUID) {
    await requestLiquidUnlock({
      chainId: currentChainId,
      isDismissible: true,
      reason,
    });
    return '';
  }

  const network = chainType === ChainType.TRON ? SupportedNetwork.Tron : SupportedNetwork.Evm;

  return requestPrivateKey({
    isDismissible: true,
    network,
    reason,
  });
};

export interface SendEvmTransactionInput {
  chain: ChainConfig;
  currency?: TransactionCurrency;
  currentAddress: string;
  evmGasLimit: string;
  evmProvider: JsonRpcProvider;
  gasFee: string;
  getAdapterByChainId: (chainId: number) => ChainAdapter;
  privateKey: string;
  selectedGas: EvmGasSettingItem;
  sendParams: TransactionConfirmParams;
  toAddress: string;
  value: string;
}

export const sendEvmTransaction = async ({
  chain,
  currency,
  currentAddress,
  evmGasLimit,
  evmProvider,
  gasFee,
  getAdapterByChainId,
  privateKey,
  selectedGas,
  sendParams,
  toAddress,
  value,
}: SendEvmTransactionInput) => {
  if (!evmProvider || gasFee === '-') {
    throw new TransactionNotReadyError();
  }

  const adapter = getAdapterByChainId(chain.chainId);
  const draft = await buildEvmTransactionDraft({
    currency,
    params: sendParams,
    chainInfo: {
      chainId: chain.chainId,
      nativeCurrency: chain.nativeCurrency,
    },
    toAddress,
    value,
  });

  const txHash = await adapter.sendTransaction({
    from: currentAddress,
    to: draft.txTo,
    value: draft.txValue,
    data: draft.txData,
    chainId: chain.chainId,
    gasLimit: evmGasLimit,
    maxPriorityFeePerGas: selectedGas.maxPriorityFeePerGas,
    maxFeePerGas: selectedGas.maxFeePerGas,
    gasPrice: selectedGas.gasPrice,
    privateKey,
  });

  await insertPendingEvmTransaction({
    chain,
    currency,
    draft,
    evmGasLimit,
    evmProvider,
    gasPrice: selectedGas.gasPrice ?? '0',
    toAddress,
    txHash,
    userAddress: currentAddress,
    value,
  });
  return txHash;
};

export interface SendTronTransactionInput {
  chain: ChainConfig;
  currency?: TransactionCurrency;
  gasFee: string;
  getAdapterByChainId: (chainId: number) => ChainAdapter;
  isNativeCurrency: boolean;
  privateKey: string;
  sendParams: TransactionConfirmParams;
  toAddress: string;
  value: string;
}

export const sendTronTransaction = async ({
  chain,
  currency,
  gasFee,
  getAdapterByChainId,
  isNativeCurrency,
  privateKey,
  sendParams,
  toAddress,
  value,
}: SendTronTransactionInput) => {
  if (gasFee === '-' || !toAddress) {
    throw new TronTransactionNotReadyError();
  }

  const adapter = getAdapterByChainId(chain.chainId);
  const provider = adapter.getProvider(chain.chainId) as TronWeb;
  const wallet = new TronWeb({
    fullNode: provider.fullNode,
    solidityNode: provider.solidityNode,
    eventServer: provider.eventServer,
    privateKey: privateKey.replace(/^0x/, ''),
  });
  const fromAddress = wallet.defaultAddress.base58;

  if (!fromAddress) {
    throw new TronTransactionNotReadyError();
  }

  let result: unknown;

  if (isNativeCurrency) {
    const sunValue = TronWeb.toSun(new BigNumber(value).toNumber());
    const tx = await wallet.transactionBuilder.sendTrx(
      toAddress,
      new BigNumber(sunValue).toNumber(),
      fromAddress,
    );
    const signedTx = await wallet.trx.sign(tx);
    result = await wallet.trx.sendRawTransaction(signedTx);
  } else {
    if (!sendParams.tokenAddress || !currency) {
      throw new TronTransactionNotReadyError();
    }

    const tx = await wallet.transactionBuilder.triggerSmartContract(
      TronWeb.address.toHex(sendParams.tokenAddress),
      'transfer(address,uint256)',
      { feeLimit: 100000000, callValue: 0 },
      [
        { type: 'address', value: toAddress },
        {
          type: 'uint256',
          value: parseUnits(value, currency.decimals).toString(),
        },
      ],
      fromAddress,
    );

    const signedTx = await wallet.trx.sign(tx.transaction);
    result = await wallet.trx.sendRawTransaction(signedTx);
  }

  if (isTronRpcErrorResponse(result)) {
    throw result;
  }

  const transaction = getTronTransactionResult(result);
  if (!transaction) {
    return null;
  }

  await insertPendingTronTransaction({
    chain,
    currency,
    fromAddress,
    gasFee,
    provider,
    toAddress,
    transaction,
    value,
  });
  return transaction.txID;
};

export interface SendLiquidTransactionInput {
  chain: ChainConfig;
  currency?: TransactionCurrency;
  currentAddress: string;
  currentChainId: number;
  gasFee: string;
  getAdapterByChainId: (chainId: number) => ChainAdapter;
  toAddress: string;
  unsignedTransaction?: UnsignedTransaction;
  value: string;
}

export const sendLiquidTransaction = async ({
  chain,
  currency,
  currentAddress,
  currentChainId,
  gasFee,
  getAdapterByChainId,
  toAddress,
  unsignedTransaction,
  value,
}: SendLiquidTransactionInput) => {
  if (!unsignedTransaction) {
    throw new LiquidTransactionNotReadyError();
  }

  const adapter = getAdapterByChainId(currentChainId);
  const signedTx = await adapter.signTransaction(unsignedTransaction);
  if (typeof signedTx === 'string') {
    throw new LiquidTransactionNotReadyError();
  }

  const txHash = await adapter.sendTransaction(signedTx);

  await insertPendingLiquidTransaction({
    chain,
    currency,
    gasFee,
    toAddress,
    txHash,
    userAddress: currentAddress,
    value,
  });
  return txHash;
};

export type SendEvmTransactionVariables = Omit<
  SendEvmTransactionInput,
  'getAdapterByChainId' | 'privateKey'
> & {
  chainType: typeof ChainType.EVM;
  currentChainId: number;
};

export type SendTronTransactionVariables = Omit<
  SendTronTransactionInput,
  'getAdapterByChainId' | 'privateKey'
> & {
  chainType: typeof ChainType.TRON;
  currentChainId: number;
};

export type SendLiquidTransactionVariables = Omit<
  SendLiquidTransactionInput,
  'getAdapterByChainId'
> & {
  chainType: typeof ChainType.LIQUID;
};

export type SendTransactionVariables =
  | SendEvmTransactionVariables
  | SendTronTransactionVariables
  | SendLiquidTransactionVariables;

export type ExecuteSendTransactionParams = SendTransactionVariables & {
  getAdapterByChainId: (chainId: number) => ChainAdapter;
  privateKey: string;
};

export const executeSendTransaction = async ({
  chainType,
  privateKey,
  getAdapterByChainId,
  ...variables
}: ExecuteSendTransactionParams): Promise<string | null> => {
  switch (chainType) {
    case ChainType.EVM:
      return sendEvmTransaction({
        ...(variables as SendEvmTransactionVariables),
        privateKey,
        getAdapterByChainId,
      });
    case ChainType.TRON:
      return sendTronTransaction({
        ...(variables as SendTronTransactionVariables),
        privateKey,
        getAdapterByChainId,
      });
    case ChainType.LIQUID:
      return sendLiquidTransaction({
        ...(variables as SendLiquidTransactionVariables),
        getAdapterByChainId,
      });
    default:
      throw new Error(`Unsupported chain type: ${chainType}`);
  }
};
