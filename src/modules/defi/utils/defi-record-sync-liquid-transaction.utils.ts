import dayjs from 'dayjs';

import type { Input, Output, Transaction } from '@roswell/react-native-gdk';

import type { ChainConfig } from '@/modules/chain/stores/chain-adapter/types';
import { ActionKey, RecordStatus } from '@/modules/database/enums/defi-record.enum';
import type { InsertDefiRecordInput } from '@/modules/database/pipes/defi-record.pipe';

export interface MapLiquidTransactionsContext {
  address: string;
  chainId: string;
  chain: ChainConfig;
}

interface LiquidAssetInfo {
  symbol: string;
  decimals: number;
  value: string;
}

const getLiquidAssetInfo = (
  transaction: Transaction,
  chain: ChainConfig,
): LiquidAssetInfo | null => {
  const assets: LiquidAssetInfo[] = [];

  for (const assetId in transaction.satoshi) {
    const amount = transaction.satoshi[assetId];
    if (amount === 0) {
      continue;
    }

    const currency = chain.supportCurrency?.find(item => item.address === assetId);
    if (!currency) {
      continue;
    }

    assets.push({
      symbol: currency.symbol,
      decimals: currency.decimals,
      value: Math.abs(amount).toString(),
    });
  }

  if (assets.length > 1) {
    return (
      assets.find(asset => {
        const currency = chain.supportCurrency?.find(item => item.symbol === asset.symbol);
        return currency?.address !== chain.nativeCurrency.address;
      }) ?? null
    );
  }

  return assets[0] ?? null;
};

const getLiquidToAddress = (transaction: Transaction) => {
  const { outputs, type } = transaction;

  if (type === 'incoming') {
    const relevantOutput = outputs.find(
      (output: Output) => output.is_relevant && !output.is_internal,
    );
    return relevantOutput?.address || relevantOutput?.unconfidential_address || '';
  }

  if (type === 'outgoing') {
    const externalOutput = outputs.find(
      (output: Output) => !output.is_relevant && !output.is_internal,
    );
    return externalOutput?.address || externalOutput?.unconfidential_address || '';
  }

  return outputs[0]?.address || outputs[0]?.unconfidential_address || '';
};

const getLiquidFromAddress = (transaction: Transaction, fallbackAddress: string) => {
  const { inputs, type } = transaction;

  if (type === 'outgoing') {
    const relevantInput = inputs.find((input: Input) => input.is_relevant);
    return relevantInput?.address || fallbackAddress;
  }

  if (type === 'incoming') {
    const externalInput = inputs.find((input: Input) => !input.is_relevant);
    return externalInput?.address || '';
  }

  return inputs[0]?.address || '';
};

const getLiquidFunctionName = (type: Transaction['type']) => {
  switch (type) {
    case 'incoming':
      return ActionKey.Received;
    case 'outgoing':
      return ActionKey.Sent;
    case 'mixed':
      return ActionKey.Swap;
    default:
      return ActionKey.ContractCall;
  }
};

const mapLiquidTransaction = (
  transaction: Transaction,
  context: MapLiquidTransactionsContext,
  explorerUrl: string,
): InsertDefiRecordInput | null => {
  const assetInfo = getLiquidAssetInfo(transaction, context.chain);
  if (!assetInfo) {
    return null;
  }

  const timestampMs = Math.floor(transaction.created_at_ts / 1000);

  return {
    userAddress: context.address,
    chainId: context.chainId,
    blockNumber: transaction.block_height.toString(),
    timeStamp: dayjs(timestampMs).utc().unix().toString(),
    hash: transaction.txhash,
    nonce: '',
    fromAddress: getLiquidFromAddress(transaction, context.address),
    toAddress: getLiquidToAddress(transaction),
    value: assetInfo.value,
    tokenSymbol: assetInfo.symbol,
    tokenDecimal: assetInfo.decimals.toString(),
    gas: transaction.fee.toString(),
    gasPrice: '1',
    status: transaction.block_height > 0 ? RecordStatus.Success : RecordStatus.Pending,
    input: '',
    functionName: getLiquidFunctionName(transaction.type),
    explorerUrl,
  };
};

export const mapLiquidTransactions = async ({
  transactions,
  context,
  buildExplorerUrl,
}: {
  context: MapLiquidTransactionsContext;
  transactions: Transaction[];
  buildExplorerUrl: (transaction: Transaction) => Promise<string>;
}) => {
  const records: InsertDefiRecordInput[] = [];

  for (const transaction of transactions) {
    if (transaction.block_height <= 0) {
      continue;
    }

    const explorerUrl = await buildExplorerUrl(transaction);
    const record = mapLiquidTransaction(transaction, context, explorerUrl);
    if (record) {
      records.push(record);
    }
  }

  return records;
};
