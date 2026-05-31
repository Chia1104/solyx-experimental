import BigNumber from 'bignumber.js';
import dayjs from 'dayjs';

import type { ChainConfig, ChainCurrency } from '@/modules/chain/stores/chain-adapter/types';
import { ActionKey, RecordStatus } from '@/modules/database/enums/defi-record.enum';
import type { InsertDefiRecordInput } from '@/modules/database/pipes/defi-record.pipe';
import { TransactionAPIType, TransactionStatus } from '@/modules/defi/enums/transactions.enum';
import type { TransactionItem } from '@/modules/defi/pipes/wallets.pipe';

export interface MapApiTransactionsContext {
  address: string;
  chainId: string;
  chain?: ChainConfig;
  isEVM: boolean;
  isTRON: boolean;
}

const apiFunctionNameMap = {
  [TransactionAPIType.Send]: ActionKey.Sent,
  [TransactionAPIType.Receive]: ActionKey.Received,
  [TransactionAPIType.Unknown]: ActionKey.ContractCall,
} as const;

const normalizeAddress = (value?: string) => value?.trim().toLowerCase() ?? '';

const isUserTransaction = (item: TransactionItem, address: string) => {
  const userAddress = normalizeAddress(address);
  return (
    normalizeAddress(item.toAddress) === userAddress ||
    normalizeAddress(item.fromAddress) === userAddress
  );
};

const findSupportedCurrency = (
  item: TransactionItem,
  supportCurrency: readonly ChainCurrency[] | undefined,
) => {
  const contractAddress = normalizeAddress(item.contractAddress ?? undefined);
  if (!contractAddress) {
    return undefined;
  }

  return supportCurrency?.find(currency => normalizeAddress(currency.address) === contractAddress);
};

const isSupportedContractTransfer = (
  item: TransactionItem,
  supportCurrency: readonly ChainCurrency[] | undefined,
) => Boolean(findSupportedCurrency(item, supportCurrency));

const isNativeZeroContractCall = (item: TransactionItem, context: MapApiTransactionsContext) => {
  if ((!context.isEVM && !context.isTRON) || normalizeAddress(item.contractAddress ?? undefined)) {
    return false;
  }

  const nativeSymbol = context.chain?.nativeCurrency.symbol.toUpperCase() ?? '';
  const itemSymbol = (item.symbol || nativeSymbol).toUpperCase();
  const amount = new BigNumber(item.amount || '0');

  return itemSymbol === nativeSymbol && amount.isFinite() && amount.isZero();
};

const filterSupportedTransactions = (
  data: TransactionItem[],
  context: MapApiTransactionsContext,
) => {
  const supportCurrency = context.chain?.supportCurrency;

  return data.filter(item => {
    if (!isUserTransaction(item, context.address)) {
      return false;
    }

    if (!item.contractAddress) {
      return true;
    }

    return isSupportedContractTransfer(item, supportCurrency);
  });
};

const removeNativeZeroDuplicates = (
  transactions: TransactionItem[],
  context: MapApiTransactionsContext,
) => {
  const supportCurrency = context.chain?.supportCurrency;
  const txIdsWithTokenTransfer = new Set(
    transactions
      .filter(item => isSupportedContractTransfer(item, supportCurrency))
      .map(item => item.txId)
      .filter(Boolean),
  );

  return transactions.filter(
    item => !(txIdsWithTokenTransfer.has(item.txId) && isNativeZeroContractCall(item, context)),
  );
};

const mapApiTransactionItem = (
  item: TransactionItem,
  context: MapApiTransactionsContext,
): InsertDefiRecordInput => {
  const currency = findSupportedCurrency(item, context.chain?.supportCurrency);

  return {
    userAddress: context.address,
    chainId: context.chainId,
    blockNumber: item.block?.toString() ?? '0',
    timeStamp: dayjs(item.blockTime).utc().unix().toString(),
    hash: item.txId,
    nonce: '',
    fromAddress: item.fromAddress ?? '',
    toAddress: item.toAddress ?? '',
    value: item.amount ?? '0',
    tokenSymbol: item.symbol ?? currency?.symbol ?? context.chain?.nativeCurrency.symbol ?? '',
    tokenDecimal:
      currency?.decimals.toString() ?? context.chain?.nativeCurrency.decimals.toString() ?? '18',
    gas: item.gasFee ?? '0',
    gasPrice: '1',
    status: item.status === TransactionStatus.Success ? RecordStatus.Success : RecordStatus.Failed,
    input: '',
    functionName: apiFunctionNameMap[item.type],
    explorerUrl: '',
  };
};

export const mapApiTransactions = (data: TransactionItem[], context: MapApiTransactionsContext) => {
  const filtered = filterSupportedTransactions(data, context);
  const normalized = removeNativeZeroDuplicates(filtered, context);

  return normalized.map(item => mapApiTransactionItem(item, context));
};
