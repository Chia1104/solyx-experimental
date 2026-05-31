import BigNumber from 'bignumber.js';
import dayjs from 'dayjs';
import { formatUnits } from 'ethers';
import type { TFunction } from 'i18next';
import { TronWeb } from 'tronweb';

import type { ChainConfig } from '@/modules/chain/stores/chain-adapter/types';
import { ChainType } from '@/modules/chain/stores/chain-adapter/types';
import { compactAddress } from '@/modules/chain/utils/address-display';
import { ActionKey, RecordStatus } from '@/modules/database/enums/defi-record.enum';
import type { DefiRecordRow } from '@/modules/database/schema/defi-record.schema';
import { DEFI_RECORDS_LIMIT } from '@/modules/defi/utils/defi-record-sync.utils';

const ACTIVITY_TIMESTAMP_MS_THRESHOLD = 1e12;

export const parseActivityRecordTime = (timeStamp: string) => {
  const value = Number(timeStamp);
  if (!Number.isFinite(value)) {
    return dayjs(Number.NaN);
  }

  return value >= ACTIVITY_TIMESTAMP_MS_THRESHOLD ? dayjs(value) : dayjs.unix(value);
};

export const ACTIVITY_RECORDS_LIMIT = DEFI_RECORDS_LIMIT;

export interface ActivityTransactionSection {
  title: string;
  data: DefiRecordRow[];
}

export type ActivityTransactionListItem =
  | {
      key: string;
      title: string;
      type: 'header';
    }
  | {
      isLastInSection: boolean;
      key: string;
      record: DefiRecordRow;
      type: 'record';
    };

export const activitySectionDateLabel = (sectionKey: string, t: TFunction<['defi', 'global']>) => {
  const date = dayjs(sectionKey);
  if (!date.isValid()) {
    return '';
  }

  if (date.isToday()) {
    return t('global:unit.today');
  }

  if (date.isYesterday()) {
    return t('global:unit.yesterday');
  }

  const dayStart = date.startOf('day');
  const todayStart = dayjs().startOf('day');

  if (dayStart.isSame(todayStart)) {
    return t('global:unit.today');
  }

  if (dayStart.isSame(todayStart.subtract(1, 'day'))) {
    return t('global:unit.yesterday');
  }

  return date.format('MMM DD, YYYY');
};

export const groupActivityRecordsByDay = (records: DefiRecordRow[]) => {
  const grouped = new Map<string, DefiRecordRow[]>();

  for (const record of records) {
    const dayKey = parseActivityRecordTime(record.timeStamp).startOf('day').toISOString();
    const bucket = grouped.get(dayKey);
    if (bucket) {
      bucket.push(record);
    } else {
      grouped.set(dayKey, [record]);
    }
  }

  return [...grouped.entries()].map(([title, data]) => ({ title, data }));
};

export const flattenActivitySections = (sections: ActivityTransactionSection[]) =>
  sections.flatMap<ActivityTransactionListItem>(section => [
    {
      key: `header-${section.title}`,
      title: section.title,
      type: 'header',
    },
    ...section.data.map((record, index) => ({
      isLastInSection: index === section.data.length - 1,
      key: `record-${record.recordKey}`,
      record,
      type: 'record' as const,
    })),
  ]);

const normalizeDecimals = (value: string | number | undefined) => {
  const decimals = Number(value ?? 18);
  return Number.isFinite(decimals) && decimals >= 0 && decimals <= 80 ? decimals : 18;
};

export const parseActivityRecordAmount = ({
  chain,
  record,
}: {
  chain?: ChainConfig;
  record: DefiRecordRow;
}) => {
  const rawValue = record.value ?? '0';
  const isAlreadyFormatted = rawValue.includes('.');
  const decimals = normalizeDecimals(record.tokenDecimal);
  const formattedValue = isAlreadyFormatted
    ? new BigNumber(rawValue)
    : new BigNumber(formatUnits(String(rawValue || '0'), decimals));

  const maximumFractionDigits =
    chain?.supportCurrency?.find(currency => currency.symbol === record.tokenSymbol)
      ?.decimalPlaces ?? 5;

  if (!formattedValue.isFinite()) {
    return { isLessThan: false, maximumFractionDigits, numericValue: 0 };
  }

  if (formattedValue.abs().isLessThan(new BigNumber(10).pow(-maximumFractionDigits))) {
    return {
      isLessThan: true,
      maximumFractionDigits,
      numericValue: new BigNumber(10).pow(-maximumFractionDigits).toNumber(),
    };
  }

  return {
    isLessThan: false,
    maximumFractionDigits,
    numericValue: formattedValue.abs().toNumber(),
  };
};

export const getActivityActionLabel = (actionKey: ActionKey, t: TFunction<['defi']>) => {
  switch (actionKey) {
    case ActionKey.Sent:
      return t('status.sent');
    case ActionKey.Swap:
      return t('status.swapped');
    case ActionKey.Received:
      return t('status.received');
    case ActionKey.Approve:
      return t('status.approved');
    default:
      return t('status.contract.interaction');
  }
};

export const buildAddressExplorerUrl = ({
  address,
  chain,
  chainType,
}: {
  address: string;
  chain?: ChainConfig;
  chainType?: ChainType;
}) => {
  const explorerBase = chain?.blockExplorers.default.url;
  if (!explorerBase || !address) {
    return '';
  }

  if (chainType === ChainType.EVM) {
    return `${explorerBase}/address/${address}`;
  }

  if (chainType === ChainType.TRON) {
    return `${explorerBase}/#/address/${address}`;
  }

  return '';
};

export const buildTransactionExplorerUrl = ({
  chain,
  chainType,
  record,
}: {
  chain?: ChainConfig;
  chainType?: ChainType;
  record: DefiRecordRow;
}) => {
  if (record.explorerUrl) {
    return record.explorerUrl;
  }

  const explorerBase = chain?.blockExplorers.default.url;
  if (!explorerBase || !record.hash) {
    return '';
  }

  if (chainType === ChainType.EVM) {
    return `${explorerBase}/tx/${record.hash}`;
  }

  if (chainType === ChainType.TRON) {
    return `${explorerBase}/#/transaction/${record.hash}`;
  }

  return '';
};

export const isPendingRecord = (record: DefiRecordRow) => record.status === RecordStatus.Pending;

export const isFailedRecord = (record: DefiRecordRow) => record.status === RecordStatus.Failed;

export const formatActivityRecordTimestamp = (timeStamp: string) =>
  parseActivityRecordTime(timeStamp).format('MMM DD, YYYY HH:mm');

export const getActivityRecordStatusLabel = (record: DefiRecordRow, t: TFunction<['defi']>) => {
  switch (record.status) {
    case RecordStatus.Failed:
      return t('status.fail');
    case RecordStatus.Pending:
      return t('status.pending');
    default:
      return t('status.success');
  }
};

export const formatActivityDetailAddress = ({
  address,
  userAddress,
  walletName,
}: {
  address: string;
  userAddress: string;
  walletName?: string;
}) => {
  const isOwnAddress = address.toLowerCase() === userAddress.toLowerCase();
  if (isOwnAddress && walletName) {
    return `${walletName} (${compactAddress(address)})`;
  }

  return compactAddress(address);
};

export const parseActivityRecordGasFee = ({
  chain,
  chainType,
  record,
}: {
  chain?: ChainConfig;
  chainType?: ChainType;
  record: DefiRecordRow;
}) => {
  if (!chain) {
    return 0;
  }

  const gasTotal = new BigNumber(record.gas).multipliedBy(record.gasPrice);

  if (chainType === ChainType.EVM) {
    if (gasTotal.lt(1e10)) {
      return gasTotal.toNumber();
    }

    return Number(formatUnits(gasTotal.toFixed(0), chain.nativeCurrency.decimals));
  }

  if (chainType === ChainType.TRON) {
    if (gasTotal.lt(1e6)) {
      return gasTotal.toNumber();
    }

    return Number(TronWeb.fromSun(gasTotal.integerValue(BigNumber.ROUND_DOWN).toNumber()));
  }

  if (chainType === ChainType.LIQUID) {
    return Number(formatUnits(record.gas, chain.nativeCurrency.decimals));
  }

  return 0;
};
